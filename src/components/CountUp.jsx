import React, { useEffect, useState, useRef } from 'react'

export default function CountUp({ target, duration = 1200, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const [value, setValue] = useState(0)
  const startTime = useRef(null)
  const raf = useRef(null)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    startTime.current = null
    const animate = (ts) => {
      if (!startTime.current) startTime.current = ts
      const elapsed = ts - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, decimals])

  const formatted = decimals > 0
    ? value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(value).toLocaleString('en-US')

  return <span className={className}>{prefix}{formatted}{suffix}</span>
}
