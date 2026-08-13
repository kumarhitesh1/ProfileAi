import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/axios';

const AuthContext=createContext();
export function useAuth(){
    return useContext(AuthContext);
}

export function AuthProvider({children}){
    const[user,setUser]=useState(null);
    const[loading,setLoading]=useState(true);

    useEffect(()=>{
        
    })
}
