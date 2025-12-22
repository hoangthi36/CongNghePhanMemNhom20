import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Backbutton.css'

export default function Backbutton({ className = '' }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(-1)
  }

  return (
    <button
      type="button"
      className={`back-button ${className}`.trim()}
      onClick={handleClick}
      aria-label="Quay lại"
    >
      ← Quay lại
    </button>
  )
}
