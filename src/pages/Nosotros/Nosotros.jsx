import { useEffect, useRef, useState } from 'react'
import './Nosotros.css'

const PHOTOCARDS = [
  { id: 1, name: "Lorenzo" },
  { id: 2, name: "Massimo" },
  { id: 3, name: "Martín" },
  { id: 4, name: "Matías" },
  { id: 5, name: "Tadeo" }
]

const Nosotros = () => {
  const containerRef = useRef(null)
  const firstCardRef = useRef(null)
  const lastCardRef = useRef(null)
  const photocardContainerRef = useRef(null)
  const [allLoaded, setAllLoaded] = useState(false)

  useEffect(() => {
    const update = () => {
      const contentEl = containerRef.current
      const first = firstCardRef.current
      const last = lastCardRef.current
      if (!contentEl || !first || !last) return

      const contentRect = contentEl.getBoundingClientRect()
      const firstRect = first.getBoundingClientRect()
      const lastRect = last.getBoundingClientRect()

      const topbarWidth = lastRect.right - contentRect.left
      const bottombarWidth = contentRect.right - firstRect.left

      contentEl.style.setProperty('--topbar-width', `${topbarWidth}px`)
      contentEl.style.setProperty('--bottombar-width', `${bottombarWidth}px`)
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const calcPhotocardDelay = (i) => {
    const totalCards = PHOTOCARDS.length
    const centerIndex = Math.floor(totalCards / 2)
    const distanceFromCenter = Math.abs(i - centerIndex)
    const maxDistance = centerIndex
    const delay = (1 - distanceFromCenter / maxDistance) * 300 + 350
    return delay
  }

  useEffect(() => {
    const lastDelay = Math.max(...PHOTOCARDS.map((_, i) => calcPhotocardDelay(i)))
    const animationDuration = 200

    const timer = setTimeout(() => {
      setAllLoaded(true)
    }, lastDelay + animationDuration)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="default nosotros">
      <div className="bg" />
      <div className="nosotros-content" ref={containerRef}>
        <div className="photocards-container" ref={photocardContainerRef}>
          {PHOTOCARDS.map((card, i) => (
            <div
              key={card.id}
              ref={i === 0 ? firstCardRef : i === PHOTOCARDS.length - 1 ? lastCardRef : null}
              className={`photocard ${allLoaded ? 'loaded' : ''}`}
              style={{ '--delay': `${calcPhotocardDelay(i)}ms` }}
            >
              <div className={`photocard-overlay ${allLoaded ? 'loaded' : ''}`} />
              <img
                className="photocard-img"
                src={`/${card.name}.webp`}
                alt={card.name}
              />
              <div className="photocard-name">
                <div>
                  <h2>{card.name}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Nosotros
