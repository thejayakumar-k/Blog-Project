import React from 'react'
import { useLanguage } from '../../i18n/useLanguage'

function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-gray-800 m-3 text-white py-4">
                <div className="container mx-auto flex justify-center">
                    <p className="text-center">{t('footerCopyright')}</p>
                </div>
            </footer>
  )
}

export default Footer
