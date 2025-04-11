import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Styled components
const Container = styled.div`
  min-height: 100vh;
  background-color: #0d1117;
  color: white;
`;

const FormContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  background-color: #161b22;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #30363d;
  background-color: #0d1117;
  color: #c9d1d9;
  &:focus {
    outline: none;
    border-color: #58a6ff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #30363d;
  background-color: #0d1117;
  color: #c9d1d9;
  min-height: 100px;
  font-family: monospace;
  &:focus {
    outline: none;
    border-color: #58a6ff;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #30363d;
  background-color: #0d1117;
  color: #c9d1d9;
  &:focus {
    outline: none;
    border-color: #58a6ff;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.variant === "danger"
      ? "#ff4444"
      : props.variant === "success"
      ? "#238636"
      : "#007BFF"};
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FieldContainer = styled.div`
  margin-bottom: 20px;
`;

const FieldRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;
`;

const RemoveButton = styled.button`
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 10px;
  cursor: pointer;
`;

const TestConfig = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    apiType: "REST",
    apiUrl: "",
    httpMethod: "GET",
    headers: [{ name: "Content-Type", value: "application/json" }],
    queryParams: [{ name: "", value: "" }],
    requestBody: "",
    graphQLQuery: "",
    graphQLVariables: "{}",
    authMethod: "None",
    authToken: "",
    selectedTests: ["sql", "xss", "ssrf"],
  });
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || null;

  // Redirect if not authenticated
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !user) {
      navigate("/");
    }
  }, [navigate, user]);

  // Update Content-Type header based on API type
  useEffect(() => {
    if (formData.apiType === "SOAP") {
      updateHeader("Content-Type", "text/xml");
    } else if (formData.apiType === "GraphQL") {
      updateHeader("Content-Type", "application/json");
      setFormData((prev) => ({ ...prev, httpMethod: "POST" }));
    } else {
      updateHeader("Content-Type", "application/json");
    }
  }, [formData.apiType]);

  const updateHeader = (name, value) => {
    const headers = [...formData.headers];
    const index = headers.findIndex((h) => h.name === name);
    if (index >= 0) {
      headers[index].value = value;
    } else {
      headers.push({ name, value });
    }
    setFormData((prev) => ({ ...prev, headers }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeaderChange = (index, field, value) => {
    const headers = [...formData.headers];
    headers[index][field] = value;
    setFormData((prev) => ({ ...prev, headers }));
  };

  const handleAddHeader = () => {
    setFormData((prev) => ({
      ...prev,
      headers: [...prev.headers, { name: "", value: "" }],
    }));
  };

  const handleRemoveHeader = (index) => {
    const headers = [...formData.headers];
    headers.splice(index, 1);
    setFormData((prev) => ({ ...prev, headers }));
  };

  const handleQueryParamChange = (index, field, value) => {
    const queryParams = [...formData.queryParams];
    queryParams[index][field] = value;
    setFormData((prev) => ({ ...prev, queryParams }));
  };

  const handleAddQueryParam = () => {
    setFormData((prev) => ({
      ...prev,
      queryParams: [...prev.queryParams, { name: "", value: "" }],
    }));
  };

  const handleRemoveQueryParam = (index) => {
    const queryParams = [...formData.queryParams];
    queryParams.splice(index, 1);
    setFormData((prev) => ({ ...prev, queryParams }));
  };

  const handleTestToggle = (test) => {
    setFormData((prev) => {
      const selectedTests = [...prev.selectedTests];
      const index = selectedTests.indexOf(test);
      if (index >= 0) {
        selectedTests.splice(index, 1);
      } else {
        selectedTests.push(test);
      }
      return { ...prev, selectedTests };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Prepare headers object
      const headersObj = formData.headers
        .filter((h) => h.name && h.value)
        .reduce((acc, h) => ({ ...acc, [h.name]: h.value }), {});

      // Add auth header if needed
      if (formData.authMethod !== "None") {
        if (formData.authMethod === "Bearer Token") {
          headersObj["Authorization"] = `Bearer ${formData.authToken}`;
        } else if (formData.authMethod === "API Key") {
          headersObj["API-Key"] = formData.authToken;
        }
      }

      // Prepare query params
      const queryParamsObj = formData.queryParams
        .filter((p) => p.name && p.value)
        .reduce((acc, p) => ({ ...acc, [p.name]: p.value }), {});

      // Prepare request body
      let requestBody = formData.requestBody;
      if (formData.apiType === "GraphQL") {
        requestBody = JSON.stringify({
          query: formData.graphQLQuery,
          variables: JSON.parse(formData.graphQLVariables || "{}"),
        });
      }

      const testRequest = {
        api_type: formData.apiType,
        url: formData.apiUrl,
        method: formData.httpMethod,
        headers: headersObj,
        params: queryParamsObj,
        body: requestBody,
        tests: formData.selectedTests,
      };

      const response = await fetch("http://localhost:8000/api/run-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to run tests");
      }

      const results = await response.json();
      setTestResults(results);
    } catch (err) {
      console.error("Test error:", err);
      setError(err.message);
      if (err.message === "Not authenticated") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Container>
      <FormContainer>
        <h1 style={{ marginBottom: "20px", textAlign: "center" }}>
          Welcome, {user?.username || "User"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* API Type Selection */}
          <FieldContainer>
            <label>API Type</label>
            <StyledSelect
              name="apiType"
              value={formData.apiType}
              onChange={handleChange}
            >
              <option value="REST">REST</option>
              <option value="SOAP">SOAP</option>
              <option value="GraphQL">GraphQL</option>
            </StyledSelect>
          </FieldContainer>

          {/* API URL */}
          <FieldContainer>
            <label>API URL</label>
            <Input
              type="text"
              name="apiUrl"
              value={formData.apiUrl}
              onChange={handleChange}
              placeholder={
                formData.apiType === "GraphQL"
                  ? "https://api.example.com/graphql"
                  : "https://api.example.com/endpoint"
              }
              required
            />
          </FieldContainer>

          {/* HTTP Method (hidden for GraphQL) */}
          {formData.apiType !== "GraphQL" && (
            <FieldContainer>
              <label>HTTP Method</label>
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                {["GET", "POST", "PUT", "DELETE", "PATCH"].map((method) => (
                  <Button
                    key={method}
                    type="button"
                    variant={formData.httpMethod === method ? "success" : ""}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, httpMethod: method }))
                    }
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </FieldContainer>
          )}

          {/* GraphQL Query Editor */}
          {formData.apiType === "GraphQL" && (
            <>
              <FieldContainer>
                <label>GraphQL Query</label>
                <TextArea
                  name="graphQLQuery"
                  value={formData.graphQLQuery}
                  onChange={handleChange}
                  placeholder={`query {\n  getUser(id: "123") {\n    name\n    email\n  }\n}`}
                  required
                />
              </FieldContainer>
              <FieldContainer>
                <label>GraphQL Variables (JSON)</label>
                <TextArea
                  name="graphQLVariables"
                  value={formData.graphQLVariables}
                  onChange={handleChange}
                  placeholder={`{\n  "id": "123"\n}`}
                />
              </FieldContainer>
            </>
          )}

          {/* Request Body for REST/SOAP */}
          {(formData.apiType !== "GraphQL" &&
            (formData.httpMethod === "POST" ||
              formData.httpMethod === "PUT" ||
              formData.httpMethod === "PATCH")) && (
            <FieldContainer>
              <label>Request Body</label>
              <TextArea
                name="requestBody"
                value={formData.requestBody}
                onChange={handleChange}
                placeholder={
                  formData.apiType === "SOAP"
                    ? '<soap:Envelope>\n  <soap:Body>\n    <!-- Your SOAP request -->\n  </soap:Body>\n</soap:Envelope>'
                    : '{\n  "key": "value"\n}'
                }
              />
            </FieldContainer>
          )}

          {/* Headers Section */}
          <FieldContainer>
            <label>Headers</label>
            {formData.headers.map((header, index) => (
              <FieldRow key={index}>
                <Input
                  type="text"
                  value={header.name}
                  onChange={(e) =>
                    handleHeaderChange(index, "name", e.target.value)
                  }
                  placeholder="Name"
                  style={{ flex: 1 }}
                />
                <Input
                  type="text"
                  value={header.value}
                  onChange={(e) =>
                    handleHeaderChange(index, "value", e.target.value)
                  }
                  placeholder="Value"
                  style={{ flex: 2 }}
                />
                <RemoveButton
                  type="button"
                  onClick={() => handleRemoveHeader(index)}
                >
                  ×
                </RemoveButton>
              </FieldRow>
            ))}
            <Button
              type="button"
              onClick={handleAddHeader}
              style={{ marginTop: "10px" }}
            >
              Add Header
            </Button>
          </FieldContainer>

          {/* Query Parameters (hidden for GraphQL) */}
          {formData.apiType !== "GraphQL" && (
            <FieldContainer>
              <label>Query Parameters</label>
              {formData.queryParams.map((param, index) => (
                <FieldRow key={index}>
                  <Input
                    type="text"
                    value={param.name}
                    onChange={(e) =>
                      handleQueryParamChange(index, "name", e.target.value)
                    }
                    placeholder="Name"
                    style={{ flex: 1 }}
                  />
                  <Input
                    type="text"
                    value={param.value}
                    onChange={(e) =>
                      handleQueryParamChange(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    style={{ flex: 2 }}
                  />
                  <RemoveButton
                    type="button"
                    onClick={() => handleRemoveQueryParam(index)}
                  >
                    ×
                  </RemoveButton>
                </FieldRow>
              ))}
              <Button
                type="button"
                onClick={handleAddQueryParam}
                style={{ marginTop: "10px" }}
              >
                Add Parameter
              </Button>
            </FieldContainer>
          )}

          {/* Authentication */}
          <FieldContainer>
            <label>Authentication</label>
            <StyledSelect
              name="authMethod"
              value={formData.authMethod}
              onChange={handleChange}
            >
              <option value="None">None</option>
              <option value="Bearer Token">Bearer Token</option>
              <option value="API Key">API Key</option>
              <option value="Basic Auth">Basic Auth</option>
            </StyledSelect>
            {formData.authMethod !== "None" && (
              <Input
                type="text"
                name="authToken"
                value={formData.authToken}
                onChange={handleChange}
                placeholder={
                  formData.authMethod === "Bearer Token"
                    ? "Bearer token"
                    : formData.authMethod === "API Key"
                    ? "API key"
                    : "Username:Password"
                }
              />
            )}
          </FieldContainer>

          {/* Security Tests Selection */}
          <FieldContainer>
            <label>Security Tests</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginTop: "8px",
              }}
            >
              {[
                "sql",
                "xss",
                "ssrf",
                "xxe",
                "rate_limit",
                "dos",
                "csrf",
                "jwt",
              ].map((test) => (
                <Button
                  key={test}
                  type="button"
                  variant={formData.selectedTests.includes(test) ? "success" : ""}
                  onClick={() => handleTestToggle(test)}
                  style={{ padding: "5px 10px", fontSize: "12px" }}
                >
                  {test.toUpperCase()}
                </Button>
              ))}
            </div>
          </FieldContainer>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          >
            {loading ? "Running Tests..." : "Run Security Test"}
          </Button>
        </form>

        {error && (
          <div style={{ color: "#f85149", marginTop: "20px" }}>
            Error: {error}
          </div>
        )}

        {testResults.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h2>Test Results</h2>
            {testResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: "15px",
                  backgroundColor: "#222",
                  marginBottom: "10px",
                  borderRadius: "4px",
                }}
              >
                <h3
                  style={{
                    color: result.vulnerable ? "#f85149" : "#3fb950",
                  }}
                >
                  {result.test_name} - {result.vulnerable ? "Vulnerable" : "Secure"}
                </h3>
                <p>
                  <strong>Confidence:</strong> {result.confidence}
                </p>
                <p>
                  <strong>Description:</strong> {result.description}
                </p>
                {result.payload && (
                  <p>
                    <strong>Payload:</strong> {result.payload}
                  </p>
                )}
                <p>
                  <strong>Recommendation:</strong> {result.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </FormContainer>
    </Container>
  );
};

export default TestConfig;