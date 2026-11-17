import axios from 'axios';
import {getToken} from '../../api/tokenService';
export function bankApi(token){
  return async(path,body)=>{
    const response=await axios.request({
      url:(import.meta.env.VITE_API_URL||'http://localhost:3001/api')+'/scholar-payout-details'+path,
      method:body===undefined?'GET':'POST',data:body,withCredentials:false,timeout:25000,
      headers:{Authorization:'Bearer '+(token||getToken()),'Content-Type':'application/json'}
    });
    return response.data;
  };
}
export const bankError=error=>error.response?.data?.message||'Payout bank services are unavailable. Your existing destination and earnings are unchanged.';
export const bankDate=value=>value?new Date(value).toLocaleString('en-GB',{timeZone:'Africa/Lagos'})+' WAT':'Not set';
