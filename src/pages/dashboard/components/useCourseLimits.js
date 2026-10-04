import { useEffect, useState } from 'react';
import axios from 'axios';
export default function useCourseLimits() {
  const [limits, setLimits] = useState(null);
  useEffect(() => {
    let active = true;
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/videos/limits`)
      .then(({ data }) => { if (active) setLimits(data); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return limits;
}
