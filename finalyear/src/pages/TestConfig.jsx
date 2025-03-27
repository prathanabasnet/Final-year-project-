import React, { useState, useEffect } from 'react';

// Navbar Component
const Navbar = () => {
  return (
    <nav style={{ 
      backgroundColor: '#161b22', 
      padding: '10px 20px', 
      color: 'white', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>SecureAPI</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Dashboard</a>
        <a href="/test-config" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Test</a>
        <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '500' }}>Logout</a>
      </div>
    </nav>
  );
};

// Main Component
const TestConfig = () => {
  // State management
  const [apiType, setApiType] = useState('REST');
  const [apiUrl, setApiUrl] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [headers, setHeaders] = useState([{ name: 'Content-Type', value: 'application/json' }]);
  const [queryParams, setQueryParams] = useState([{ name: '', value: '' }]);
  const [requestBody, setRequestBody] = useState('');
  const [graphQLQuery, setGraphQLQuery] = useState('');
  const [graphQLVariables, setGraphQLVariables] = useState('{}');
  const [authMethod, setAuthMethod] = useState('None');
  const [authToken, setAuthToken] = useState('');

  // Handler functions
  const handleHeaderChange = (index, field, value) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { name: '', value: '' }]);
  };

  const handleRemoveHeader = (index) => {
    const updatedHeaders = [...headers];
    updatedHeaders.splice(index, 1);
    setHeaders(updatedHeaders);
  };

  const handleQueryParamChange = (index, field, value) => {
    const updatedQueryParams = [...queryParams];
    updatedQueryParams[index][field] = value;
    setQueryParams(updatedQueryParams);
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { name: '', value: '' }]);
  };

  const handleRemoveQueryParam = (index) => {
    const updatedQueryParams = [...queryParams];
    updatedQueryParams.splice(index, 1);
    setQueryParams(updatedQueryParams);
  };

  // Effect hooks
  useEffect(() => {
    if (apiType === 'SOAP') {
      setHeaders([{ name: 'Content-Type', value: 'text/xml' }]);
    } else if (apiType === 'GraphQL') {
      setHeaders([{ name: 'Content-Type', value: 'application/json' }]);
      setHttpMethod('POST');
    } else {
      setHeaders([{ name: 'Content-Type', value: 'application/json' }]);
    }
  }, [apiType]);

  useEffect(() => {
    if (apiType === 'GraphQL') {
      try {
        setRequestBody(JSON.stringify({
          query: graphQLQuery,
          variables: JSON.parse(graphQLVariables || '{}')
        }, null, 2));
      } catch (e) {
        console.error('Invalid GraphQL variables JSON');
      }
    }
  }, [graphQLQuery, graphQLVariables, apiType]);

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      apiType,
      apiUrl,
      httpMethod,
      headers: headers.filter(h => h.name && h.value),
      queryParams: apiType !== 'GraphQL' ? queryParams.filter(p => p.name && p.value) : null,
      requestBody: apiType === 'GraphQL' 
        ? JSON.stringify({ 
            query: graphQLQuery, 
            variables: JSON.parse(graphQLVariables || '{}') 
          })
        : requestBody,
      authMethod,
      authToken
    };
    console.log('Form Data:', formData);
    // Here you would typically send the data to your backend
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#0b1120',
    color: 'white'
  };

  const formContainerStyle = {
    maxWidth: '800px',
    margin: '20px auto',
    backgroundColor: '#161b22',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '8px',
    borderRadius: '4px',
    border: '1px solid #30363d',
    backgroundColor: '#0d1117',
    color: '#c9d1d9'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '4px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '10px'
  };

  const methodButtonStyle = (method) => ({
    ...buttonStyle,
    backgroundColor: httpMethod === method ? '#238636' : '#333'
  });

  const removeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ff4444'
  };

  return (
    <div style={containerStyle}>
      <Navbar />
      <div style={formContainerStyle}>
        <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>API Security Test</h1>
        
        <form onSubmit={handleSubmit}>
          {/* API Type Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label>API Type</label>
            <select
              value={apiType}
              onChange={(e) => setApiType(e.target.value)}
              style={inputStyle}
            >
              <option value="REST">REST</option>
              <option value="SOAP">SOAP</option>
              <option value="GraphQL">GraphQL</option>
            </select>
          </div>

          {/* API URL */}
          <div style={{ marginBottom: '20px' }}>
            <label>API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder={
                apiType === 'GraphQL' 
                  ? "https://api.example.com/graphql" 
                  : "https://api.example.com/endpoint"
              }
              style={inputStyle}
              required
            />
          </div>

          {/* HTTP Method (hidden for GraphQL) */}
          {apiType !== 'GraphQL' && (
            <div style={{ marginBottom: '20px' }}>
              <label>HTTP Method</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {['GET', 'POST', 'PUT', 'DELETE'].map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setHttpMethod(method)}
                    style={methodButtonStyle(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GraphQL Query Editor */}
          {apiType === 'GraphQL' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label>GraphQL Query</label>
                <textarea
                  value={graphQLQuery}
                  onChange={(e) => setGraphQLQuery(e.target.value)}
                  placeholder={`query {\n  getUser(id: "123") {\n    name\n    email\n  }\n}`}
                  style={{ ...inputStyle, minHeight: '150px', fontFamily: 'monospace' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label>Variables (JSON)</label>
                <textarea
                  value={graphQLVariables}
                  onChange={(e) => setGraphQLVariables(e.target.value)}
                  placeholder={`{\n  "id": "123"\n}`}
                  style={{ ...inputStyle, minHeight: '100px', fontFamily: 'monospace' }}
                />
              </div>
            </>
          )}

          {/* Request Body for REST/SOAP */}
          {(apiType !== 'GraphQL' && (httpMethod === 'POST' || httpMethod === 'PUT')) && (
            <div style={{ marginBottom: '20px' }}>
              <label>Request Body</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder={
                  apiType === 'SOAP' 
                    ? '<soap:Envelope>\n  <soap:Body>\n    <!-- Your SOAP request -->\n  </soap:Body>\n</soap:Envelope>' 
                    : '{\n  "key": "value"\n}'
                }
                style={{ ...inputStyle, minHeight: '150px', fontFamily: 'monospace' }}
              />
            </div>
          )}

          {/* Headers Section */}
          <div style={{ marginBottom: '20px' }}>
            <label>Headers</label>
            {headers.map((header, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  value={header.name}
                  onChange={(e) => handleHeaderChange(index, 'name', e.target.value)}
                  placeholder="Name"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  placeholder="Value"
                  style={{ ...inputStyle, flex: 2 }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHeader(index)}
                  style={removeButtonStyle}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddHeader}
              style={{ ...buttonStyle, marginTop: '10px' }}
            >
              Add Header
            </button>
          </div>

          {/* Query Parameters (hidden for GraphQL) */}
          {apiType !== 'GraphQL' && (
            <div style={{ marginBottom: '20px' }}>
              <label>Query Parameters</label>
              {queryParams.map((param, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => handleQueryParamChange(index, 'name', e.target.value)}
                    placeholder="Name"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    type="text"
                    value={param.value}
                    onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                    placeholder="Value"
                    style={{ ...inputStyle, flex: 2 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQueryParam(index)}
                    style={removeButtonStyle}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddQueryParam}
                style={{ ...buttonStyle, marginTop: '10px' }}
              >
                Add Parameter
              </button>
            </div>
          )}

          {/* Authentication */}
          <div style={{ marginBottom: '20px' }}>
            <label>Authentication</label>
            <select
              value={authMethod}
              onChange={(e) => setAuthMethod(e.target.value)}
              style={inputStyle}
            >
              <option value="None">None</option>
              <option value="API Key">API Key</option>
              <option value="Bearer Token">Bearer Token</option>
              <option value="OAuth">OAuth</option>
            </select>
            {authMethod !== 'None' && (
              <input
                type="text"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder={`Enter ${authMethod}`}
                style={inputStyle}
              />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...buttonStyle,
              width: '100%',
              padding: '12px 24px',
              fontSize: '16px'
            }}
          >
            Run Security Test
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestConfig;