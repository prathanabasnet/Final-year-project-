from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel
from models import User, TestResultDB, APITestRequest, TestResult, UserCreate, UserResponse, Token, TokenData, ProtectedResponse, Base
from security_tests.scanner import APISecurityScanner

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Password hashing utility
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# Authenticate user
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

# Create JWT token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Get current user from JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Pydantic model for Token response
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

# Login endpoint
@app.post("/api/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    print(f"Login attempt for username: {form_data.username}")
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        print("Authentication failed: Incorrect username or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    print(f"User authenticated: {user.username}, email: {user.email}, id: {user.id}")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    response = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user.username,
            "email": user.email,
            "id": user.id
        }
    }
    print(f"Login response: {response}")
    return response

# Protected endpoint
@app.get("/api/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello, {current_user.username}! You are authenticated.", "username": current_user.username}

# Signup endpoint
@app.post("/api/signup", response_model=UserResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_email = db.query(User).filter(User.email == user.email).first()
    if db_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Debug endpoint to list users
@app.get("/debug/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

# Token verification endpoint
@app.post("/api/verify-token")
async def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {"valid": True, "username": username}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Endpoint to run security tests
@app.post("/api/run-tests", response_model=List[TestResult])
async def run_security_tests(
    test_request: APITestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scanner = APISecurityScanner()
    results = await scanner.run_tests(test_request)
    
    # Store results in the database
    for result in results:
        db_result = TestResultDB(
            user_id=current_user.id,
            test_name=result.test_name,
            api_type=test_request.api_type,
            url=test_request.url,
            vulnerable=result.vulnerable,
            confidence=result.confidence,
            description=result.description,
            payload=result.payload,
            recommendation=result.recommendation
        )
        db.add(db_result)
    db.commit()
    
    return results

# Vulnerable test endpoint (for testing purposes)
@app.get("/vulnerable-test")
async def vulnerable_test(id: str):
    # Deliberately vulnerable endpoint
    if "'" in id or "1=1" in id:  # Simple SQLi check
        return {"error": "SQL syntax error near..."}
    return {"result": "ok"}

# Endpoint to fetch test results for the dashboard
@app.get("/api/results", response_model=List[TestResult])
def get_test_results(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(TestResultDB).filter(TestResultDB.user_id == current_user.id).all()
    return [
        TestResult(
            test_name=result.test_name,
            vulnerable=result.vulnerable,
            confidence=result.confidence,
            description=result.description,
            payload=result.payload,
            recommendation=result.recommendation
        )
        for result in results
    ]

# Endpoint for dashboard stats
@app.get("/api/dashboard")
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(TestResultDB).filter(TestResultDB.user_id == current_user.id).all()
    
    total_tests = len(results)
    vulnerabilities = sum(1 for r in results if r.vulnerable)
    workflows = 1  # Placeholder, you can implement logic for workflows
    
    # Categorize vulnerabilities by severity (based on confidence)
    critical = sum(1 for r in results if r.vulnerable and r.confidence >= 0.9)
    high = sum(1 for r in results if r.vulnerable and 0.7 <= r.confidence < 0.9)
    medium = sum(1 for r in results if r.vulnerable and 0.5 <= r.confidence < 0.7)
    low = sum(1 for r in results if r.vulnerable and r.confidence < 0.5)
    
    # Group by test name for categories chart
    categories = {}
    for r in results:
        if r.vulnerable:
            categories[r.test_name] = categories.get(r.test_name, 0) + 1
    
    # Group by month for timeline chart
    timeline = {}
    for r in results:
        month = r.created_at.strftime("%B")
        timeline[month] = timeline.get(month, 0) + (1 if r.vulnerable else 0)
    
    return {
        "stats": {
            "total_tests": total_tests,
            "vulnerabilities": vulnerabilities,
            "tests": total_tests,
            "workflows": workflows
        },
        "risk_levels": {
            "critical": critical,
            "high": high,
            "medium": medium,
            "low": low
        },
        "categories": categories,
        "timeline": timeline
    }