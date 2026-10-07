import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { setupAxiosInterceptor } from '../utils/axiosInterceptor';
import { createAuthSession, secondsRemaining } from '../utils/authSession.mjs';
export const AuthContext=createContext();
const base=import.meta.env.VITE_API_URL||'http://localhost:3001/api';
const stored=()=>{try{const value=JSON.parse(sessionStorage.getItem('user'));return value?.token&&(secondsRemaining(value.token)>0||value.refreshToken)?value:null;}catch{return null;}};
export const AuthProvider=({children})=>{
 const [user,setUser]=useState(stored),[loading,setLoading]=useState(false),[sessionError,setSessionError]=useState(null);
 const current=useRef(user);current.current=user;
 const write=useCallback(value=>{current.current=value;setUser(value);if(value)sessionStorage.setItem('user',JSON.stringify(value));else sessionStorage.removeItem('user');localStorage.removeItem('user');},[]);
 const clear=useCallback(()=>write(null),[write]);
 const client=useRef(null);
 if(!client.current)client.current=createAuthSession({read:()=>current.current,write,clear,request:async(path,body,token)=>{
  const response=await axios.post(base+path,body,{skipSessionHandling:true,...(token?{headers:{Authorization:`Bearer ${token}`}}:{})});return response.data;
 }});
 const login=async(email,password)=>{
  setLoading(true);setSessionError(null);
  try{
   const {data}=await axios.post(base+'/auth/login',{email,password},{skipSessionHandling:true});
   if(data.requires2FA)return{ok:false,requires2FA:true,challengeToken:data.challengeToken,message:data.message};
   const value=client.current.store(data);return{ok:true,user:value};
  }catch(error){return{ok:false,message:error.response?.data?.message||error.response?.data?.error||'Unable to sign in. Please try again.'};}
  finally{setLoading(false);}
 };
 const completeTwoFactor=async(challengeToken,code)=>{
  setLoading(true);
  try{
   const proof=/^\d{6}$/.test(code)?{token:code}:{backupCode:code.trim()};
   const {data}=await axios.post(base+'/2fa/validate',{challengeToken,...proof},{skipSessionHandling:true});
   return{ok:true,user:client.current.store(data)};
  }catch(error){return{ok:false,message:error.response?.data?.message||'Unable to verify. Start sign-in again if your challenge expired.'};}
  finally{setLoading(false);}
 };
 const refresh=useCallback(()=>client.current.refresh(),[]);
 const logout=useCallback(async()=>{
  try{await client.current.logout();setSessionError(null);return true;}
  catch{setSessionError('Unable to revoke your session. Please retry sign out when connected.');return false;}
 },[]);
 useEffect(()=>setupAxiosInterceptor(clear,refresh,()=>current.current),[clear,refresh]);
 useEffect(()=>{
  let busy=false;
  const check=async()=>{
   if(busy||!current.current?.token||secondsRemaining(current.current.token)>300)return;
   if(!current.current.refreshToken){clear();return;}
   busy=true;
   try{await refresh();setSessionError(null);}catch(error){
    if(error.response?.status===401)clear();
    else setSessionError('Session renewal is temporarily unavailable. Please retry.');
   }finally{busy=false;}
  };
  check();const timer=setInterval(check,60000);return()=>clearInterval(timer);
 },[clear,refresh]);
 const updateUser=updatedFields=>write(current.current?{...current.current,...updatedFields}:null);
 return <AuthContext.Provider value={{user,login,completeTwoFactor,logout,updateUser,loading,sessionError}}>{sessionError&&<div role="alert" className="alert alert-warning">{sessionError}</div>}{children}</AuthContext.Provider>;
};
export const useAuth=()=>useContext(AuthContext);
