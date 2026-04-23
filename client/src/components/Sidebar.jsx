import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import { House, SquarePen, Hash,Image, Eraser, Scissors, FileText, Users, LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL=import.meta.env.VITE_BASE_URL;




const navItems=[
    {to:'/ai',label:'Dashboard',Icon: House},
    {to:'/ai/write-article',label:'Write Article',Icon: SquarePen },
    {to:'/ai/blog-titles',label:'Blog Title',Icon: Hash},
  {to:'/ai/research-paper',label:'Research Paper',Icon: FileText},
    {to:'/ai/generate-images',label:'Generate Images',Icon: Image},
    {to:'/ai/remove-background',label:'Remove Background',Icon: Eraser},
    {to:'/ai/remove-object',label:'Remove Object',Icon: Scissors},
    {to:'/ai/review-resume',label:'Review Resume',Icon: FileText},
    {to:'/ai/community',label:'Community',Icon: Users},
]
const Sidebar = ({sidebar,setSidebar}) => {
    const {user}=useUser();
    const { getToken } = useAuth();
    const {signOut,openUserProfile}=useClerk();
    const [plan, setPlan] = useState('free');

    useEffect(() => {
      const fetchPlan = async () => {
        try {
          const token = await getToken();
          const { data } = await axios.get('/api/user/get-user-plan', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (data.success) {
            setPlan(data.plan);
          }
        } catch {
          setPlan('free');
        }
      };

      if (user) {
        fetchPlan();
      }
      const refreshOnFocus = () => {
        if (user) {
          fetchPlan();
        }
      }

      window.addEventListener('focus', refreshOnFocus)
      document.addEventListener('visibilitychange', refreshOnFocus)

      return () => {
        window.removeEventListener('focus', refreshOnFocus)
        document.removeEventListener('visibilitychange', refreshOnFocus)
      }
    }, [user, getToken]);

  return (
    <div className={`w-60 bg-white border-r border-gray-200 flex flex-col
    justify-between items-center max-sm:absolute top-14 bottom-0 ${sidebar ? 'translate-x-0':'max-sm:-translate-x-full'} transition-all duration-300
    ease-in-out `}>
<div className='my-7 w-full'>
<img src={user?.imageUrl} alt="user avatar"  className='w-13 rounded-full mx-auto'/>
<h1 className='mt-1 text-center'>{user?.fullName}</h1>
<div className='px-6 mt-5 text-sm text-gray-600 font-medium'>
    {navItems.map(({to,label,Icon})=>(
        <NavLink key={to} to={to} end={to ==='/ai'} onClick={()=> setSidebar(false)} className={({isActive})=>`px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234Ea] text-white' : ''}`}>
            {({isActive})=>(
                <> 
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : ''}`} />  
                   {label}
                </>
            )}
        </NavLink>
    ))} 
</div>
</div>

<div className='w-full border-t border-gray-200 p-4 px-7 flex items-center
justify-between'>
<div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
  <img src={user.imageUrl} className='w-8 rounded-full' alt="" />
  <div>
    <h1 className='text-sm font-medium'>{user.fullName}</h1>
    <p className='text-xs text-gray-500'>
     {plan === 'premium' ? 'Premium' : 'Free'}
     Plan
    </p>
  </div>
</div>
<LogOut onClick={signOut} className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer'/>
</div>
    </div>
  )
}

export default Sidebar