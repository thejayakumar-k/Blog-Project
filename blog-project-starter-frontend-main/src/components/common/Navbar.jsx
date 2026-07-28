import React from 'react'
import "./Navbar.css"
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {signOut, onAuthStateChanged} from "firebase/auth"
import auth from "../../config/firebase"
import axios from "axios"
import { useLanguage } from "../../i18n/useLanguage"

const backendUrl = import.meta.env.VITE_API_URL;
const ADMIN_UID = "LV8ISOCjT3P2m78MqHnw1s1eeYh2";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "hi", label: "हिन्दी", short: "हि" },
  { code: "ta", label: "தமிழ்", short: "த" },
  { code: "te", label: "తెలుగు", short: "తె" },
  { code: "kn", label: "ಕನ್ನಡ", short: "ಕ" },
  { code: "ml", label: "മലയാളം", short: "മ" },
];

const LONG_LANGS = ["hi", "ta", "te", "kn", "ml"];

function Navbar() {
    const navigate = useNavigate()
    const { lang, setLang, t } = useLanguage()
    const [log, setLog] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [isVendor, setIsVendor] = useState(false)
    const [userName, setUserName] = useState("Personal")
    const [showPayment, setShowPayment] = useState(false)
    const [showLanguage, setShowLanguage] = useState(false)

    const isLong = LONG_LANGS.includes(lang);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if(user){
          setLog(true)
          if(user.uid === ADMIN_UID){
            setIsAdmin(true)
            setIsVendor(false)
            setUserName("Admin")
            setShowPayment(true)
            setShowLanguage(true)
          } else {
            try {
              const { data: vendors } = await axios.get(`${backendUrl}/api/vendors`);
              const vendor = vendors.find(v => v.vendorId === user.uid);
              const { data: features } = await axios.get(`${backendUrl}/api/vendor-features`);
              const feat = features.find(f => f.vendorId === user.uid);

              if(vendor){
                setIsVendor(true)
                setUserName(vendor.vendorName);
                setShowPayment(feat ? feat.upiPayment : false);
                setShowLanguage(feat ? feat.multiLanguage : false);
              } else {
                setIsVendor(false)
                try {
                  const { data: customers } = await axios.get(`${backendUrl}/api/customer-by-uid/${user.uid}`);
                  setUserName(customers.customerName || "Customer");
                  setShowPayment(customers.upiPayment || false);
                  setShowLanguage(customers.multiLanguage || false);
                } catch {
                  setUserName("Customer");
                  setShowPayment(false);
                  setShowLanguage(false);
                }
              }
            } catch {
              setIsVendor(false)
              setUserName("Customer");
              setShowPayment(false);
              setShowLanguage(false);
            }
          }
        }
        else{
          setLog(false)
          setIsAdmin(false)
          setUserName("Personal")
          setShowPayment(false)
          setShowLanguage(false)
        }
      })
      return () => unsubscribe()
    }, [])

    function logout(){
      signOut(auth).then(() => {
        navigate("/login");
      })
    }

    const navClass = `flex items-center ${isLong ? 'gap-1' : 'gap-0'}`;
    const linkClass = isLong
      ? 'list-none px-2 py-1 text-xs leading-tight whitespace-nowrap'
      : 'list-none px-3 py-1 text-sm';

  return (
    <div className='py-3 px-4 flex justify-between items-center overflow-x-auto sticky top-0 bg-white z-50 shadow-sm'>
        {log && <h2 className={`font-bold shrink-0 ${isLong ? 'text-lg' : 'text-xl'}`}>{userName}</h2>}
        <div className={navClass}>
            <Link className={linkClass} to={"/home"}>{t('navHome')}</Link>
            <Link className={linkClass} to={"/blogs"}>{t('navBlogs')}</Link>
            {log && showPayment && <Link className={linkClass} to={"/payment"}>{t('navPayment')}</Link>}
            <Link className={linkClass}>{t('navAbout')}</Link>
            {isAdmin && (
              <Link className={`${linkClass} text-blue-600 font-semibold`} to={"/admin/vendor-features"}>{t('navAdmin')}</Link>
            )}
            {isVendor && (
              <Link className={`${linkClass} text-blue-600 font-semibold`} to={"/vendor/customize"}>{t('navAdmin')}</Link>
            )}

            {showLanguage && (
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className='mx-2 px-2 py-1 border border-gray-300 rounded text-xs bg-white cursor-pointer shrink-0 min-w-[90px]'
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            )}

            {log ? (
              <button className='button-style text-xs px-4 py-2 ml-1' onClick={logout}>{t('navLogout')}</button>
            ) : (
              <Link className={`${linkClass} bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold text-xs`} to={"/login"}>{t('navLogin')}</Link>
            )}
          
        </div>
    </div>
  )
}

export default Navbar
