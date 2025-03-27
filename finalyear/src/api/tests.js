export const fetchDashboardData = async () => {
    const response = await fetch("/api/dashboard");
    return response.json();
  };
  
  export const fetchResults = async () => {
    const response = await fetch("/api/results");
    return response.json();
  };
  