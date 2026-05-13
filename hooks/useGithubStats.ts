"use client";

import { useState, useEffect } from "react";

export const useGithubStats = (username: string) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch stats logic
  }, [username]);

  return { stats, loading, error };
};
