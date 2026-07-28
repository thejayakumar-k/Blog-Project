import React, { useState, useEffect } from 'react'
import Navbar from './common/Navbar'
import BlogProfileImage from "../assets/Blog Website Design.jpg"
import CSS from "../assets/css-3.png"
import HTML from "../assets/html.png"
import DB from "../assets/data-server.png"
import JS from "../assets/js.png"
import REACTICON from "../assets/physics.png"
import NODE from "../assets/node-js.png"
import BlogImage from "../assets/blogImage.png"
import { useNavigate } from 'react-router-dom';
import Footer from './common/Footer'
import SubscriptionCards from './SubscriptionCards'
import { useLanguage } from '../i18n/useLanguage'
import auth from "../config/firebase"
import { onAuthStateChanged } from "firebase/auth"
import axios from "axios"

const backendUrl = import.meta.env.VITE_API_URL;
const ADMIN_UID = "LV8ISOCjT3P2m78MqHnw1s1eeYh2";

function Home() {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const [isVendor, setIsVendor] = useState(false)

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if(user && user.uid !== ADMIN_UID){
          try {
            const { data } = await axios.get(`${backendUrl}/api/vendors`);
            setIsVendor(data.some(v => v.vendorId === user.uid));
          } catch {
            setIsVendor(false);
          }
        } else {
          setIsVendor(false);
        }
      })
      return () => unsubscribe()
    }, [])

    return (
        <div>

            <div className='flex items-center justify-center'>
                <div className="w-full sm:w-1/2 flex-col justify-center">
                    <h2 className='text-3xl md:text-6xl font-bold pb-2'>{t('homeGreeting')}</h2>
                    <h2 className='text-4xl md:text-7xl font-bold text-orange-400 py-2'>{t('homeName')}</h2>
                    <img src={BlogProfileImage} className='w-60 block sm:hidden' alt="Blog Profile Image" />
                    <p className='py-2'>{t('homeDesc')}</p>
                    <button className='button-style mt-2'>{t('homeHireMe')}</button>
                </div>
                <div className='justify-center hidden sm:block'>
                    <img src={BlogProfileImage} className='w-60 md:w-96 ' alt="Blog Profile Image" />

                </div>

            </div>


            <div className='flex justify-evenly py-6'>
                <img src={HTML} style={{ width: "50px" }} />
                <img src={CSS} style={{ width: "50px" }} />
                <img src={JS} style={{ width: "50px" }} />
                <img src={REACTICON} style={{ width: "50px" }} />
                <img src={DB} style={{ width: "50px" }} />
                <img src={NODE} style={{ width: "50px" }} />
            </div>

            {isVendor && <SubscriptionCards />}


            <div className='flex items-center justify-center my-14'>
                <div className='justify-center hidden sm:block'>
                    <img src={BlogImage} className='w-60 md:w-96 ' alt="Blog Profile Image" />

                </div>
                <div className="w-full sm:w-1/2 flex-col justify-center ml-6">
                    <h2 className='text-3xl md:text-6xl font-bold pb-2'>{t('homeBlogTitle')}</h2>
                    <h2 className='text-4xl md:text-7xl font-bold text-orange-400 py-2'>{t('homeBlogSubtitle')}</h2>

                    <p className='py-2'>{t('homeBlogDesc')}</p>
                    <button className='button-style mt-2' onClick={() => navigate("/blogs")}>{t('homeReadBlogs')}</button>
                </div>


            </div>


            <Footer/>


        </div>
    )
}

export default Home
