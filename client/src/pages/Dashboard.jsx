import React , { useState, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { Gem } from 'lucide-react'
import CreationItem from '../components/CreationItem.jsx'
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations,setCreations]=useState([])
  const [plan,setPlan]=useState('free')
  const [loading,setLoading]=useState(true)
  const{getToken}=useAuth()

  const getDashboardData=async()=>{
    // setCreations(dummyCreationData) //fetch and set creations
    try{
const token = await getToken()
const [creationsRes, planRes] = await Promise.all([
  axios.get('/api/user/get-user-creations',{
          headers:{
            Authorization: `Bearer ${token}`,
          }
}),
  axios.get('/api/user/get-user-plan',{
    headers:{
      Authorization: `Bearer ${token}`,
    }
  })
])
        if(creationsRes.data.success){
          setCreations(creationsRes.data.creations)
        }
        else{
          toast.error(creationsRes.data.message)
        }

        if (planRes.data.success) {
          setPlan(planRes.data.plan)
        }
    }
    catch(error){
      toast.error(error.message)
    }
    setLoading(false)
  }
  useEffect(()=>{
    getDashboardData()
    const refreshOnFocus = () => getDashboardData()
    window.addEventListener('focus', refreshOnFocus)
    document.addEventListener('visibilitychange', refreshOnFocus)

    return () => {
      window.removeEventListener('focus', refreshOnFocus)
      document.removeEventListener('visibilitychange', refreshOnFocus)
    }
  },[])
  return (
    <div className='h-full overflow-y-scroll p-6'>
       <div className='flex justify-start gap-4 flex-wrap'>
         <div className='flex justify-between items-center w-72 p-4 px-6 bg-white
         rounded-xl border border-gray-200'>
<div className='text-slate-600'>
  <p className='text-sm'>Total Creations</p>
  <h2 className='text-xl font-semibold'>{creations.length}</h2>
</div>
<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2]
to-[#0BB0D7] text-white flex justify-center items-center'>
  <Sparkles className='w-5 text-white' />
</div>
         </div>

          <div className='flex justify-between items-center w-72 p-4 px-6 bg-white
         rounded-xl border border-gray-200'>
<div className='text-slate-600'>
  <p className='text-sm'>Active Plan</p>
  <h2 className='text-xl font-semibold'>
    {plan === 'premium' ? 'Premium' : 'Free'}
  </h2>
</div>
<div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5]
to-[#9E53EE] text-white flex justify-center items-center'>
  <Gem className='w-5 text-white' />
</div>
         </div>
       </div>
{
  loading ? (
<div className='flex justify-center items-center h-3/4'>
  <div className='animate-spin rounded-full h-11 w-11 border-3
  border-purple-500 border-t-transparent'></div>
</div>
  ):(
     <div className='space-y-3'>
        <p className='mt-6 mb-4'>Recent Creations</p>
        {creations.map((item)=><CreationItem  key={item.id} item={item}/>)}

       </div>
  )
}</div>
       )
  
}

export default Dashboard;