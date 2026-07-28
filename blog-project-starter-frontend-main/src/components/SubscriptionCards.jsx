import React, { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'

function SubscriptionCards() {
  const { t } = useLanguage()
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t('subscriptionTitle')}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 bg-gray-100 rounded-full p-1 w-fit mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly' ? 'bg-white shadow-md text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'yearly' ? 'bg-white shadow-md text-gray-800' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('yearly')}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

          {/* BASIC CARD - Multi Language Support */}
          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">🌐</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('basic')}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  {billingCycle === 'monthly' ? t('basicMonthlyPrice') : t('basicYearlyPrice')}
                </span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <span className="inline-block mt-3 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">{t('multiLanguage')}</span>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 mb-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-blue-500">✔</span> {t('subMultiLang1')}</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-blue-500">✔</span> {t('subMultiLang2')}</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-blue-500">✔</span> {t('subMultiLang3')}</p>
            </div>

            <button className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200 hover:opacity-90 hover:shadow-lg">
              {t('selectPlan')}
            </button>
          </div>

          {/* PROFESSIONAL CARD - Voice Enabled */}
          <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl ring-4 ring-purple-400 md:scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                {t('popular')}
              </span>
            </div>

            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">🎙️</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('pro')}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent">
                  {billingCycle === 'monthly' ? t('proMonthlyPrice') : t('proYearlyPrice')}
                </span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <span className="inline-block mt-3 bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">{t('voiceEnabled')}</span>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 mb-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-purple-500">✔</span> {t('subVoice1')}</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-purple-500">✔</span> {t('subVoice2')}</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-purple-500">✔</span> {t('subVoice3')}</p>
            </div>

            <button className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-200 hover:opacity-90 hover:shadow-lg">
              {t('selectPlan')}
            </button>
          </div>

          {/* ENTERPRISE CARD - Payment Gateway */}
          <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border-2 border-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-5xl mb-4 block">💳</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{t('enterprise')}</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-red-400 bg-clip-text text-transparent">
                  {billingCycle === 'monthly' ? t('enterpriseMonthlyPrice') : t('enterpriseYearlyPrice')}
                </span>
                <span className="text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              </div>
              <span className="inline-block mt-3 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">{t('paymentGateway')}</span>
            </div>

            <div className="bg-white/60 rounded-2xl p-4 mb-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-orange-500">✔</span> {t('subPayment1')}</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-orange-500">✔</span> {t('subPayment2')}</p>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2"><span className="text-orange-500">✔</span> {t('subPayment3')}</p>
            </div>

            <button className="w-full py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-400 transition-all duration-200 hover:opacity-90 hover:shadow-lg">
              {t('selectPlan')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionCards
