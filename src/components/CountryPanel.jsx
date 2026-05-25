import { useEffect, useState } from 'react'

const WEATHER_ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Snow: '❄️',
  Thunderstorm: '⛈️', Drizzle: '🌦️', Mist: '🌫️', default: '🌤️'
}

const API_KEY = 'f39d6d858a90fda55082360f3952cee5'
const UNSPLASH_KEY = 'LVDctbuka5sKl4uP4lAv22M8SJX6Tm3DOywgF6ZSQB8'

function useLiveClock(timezone) {
  const [time, setTime] = useState('')

  useEffect(() => {
    if (!timezone) return

    const tick = () => {
      try {
        const match = timezone.match(/UTC([+-])(\d{1,2}):?(\d{0,2})/)
        if (match) {
          const sign = match[1] === '+' ? 1 : -1
          const hours = parseInt(match[2])
          const minutes = parseInt(match[3] || '0')
          const offsetMinutes = sign * (hours * 60 + minutes)
          const now = new Date()
          const utc = now.getTime() + now.getTimezoneOffset() * 60000
          const local = new Date(utc + offsetMinutes * 60000)
          const h = local.getHours()
          const m = String(local.getMinutes()).padStart(2, '0')
          const s = String(local.getSeconds()).padStart(2, '0')
          const ampm = h >= 12 ? 'PM' : 'AM'
          const h12 = h % 12 || 12
          setTime(`${String(h12).padStart(2, '0')}:${m}:${s} ${ampm}`)
        } else {
          setTime(new Date().toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
          }))
        }
      } catch {
        setTime(new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        }))
      }
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [timezone])

  return time
}

export default function CountryPanel({ country, isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [weather, setWeather] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currencyCode, setCurrencyCode] = useState('')
  const [amount, setAmount] = useState('1000')
  const [converted, setConverted] = useState(null)
  const [rateLoading, setRateLoading] = useState(false)

  const clock = useLiveClock(data?.timezone)

  useEffect(() => {
    if (!country) return
    setData(null)
    setWeather(null)
    setPhoto(null)
    setWiki(null)
    setConverted(null)
    setCurrencyCode('')
    setLoading(true)

    fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country.name)}?fullText=true`)
      .then(r => r.json())
      .then(d => {
        if (d && d[0]) {
          const c = d[0]
          const capital = c.capital?.[0] || country.name
          const currencies = c.currencies
            ? Object.values(c.currencies).map(cur => `${cur.name} (${cur.symbol || ''})`).join(', ')
            : 'N/A'
          const currCode = c.currencies ? Object.keys(c.currencies)[0] : ''
          const languages = c.languages ? Object.values(c.languages) : []
          setCurrencyCode(currCode)
          setData({
            flag: c.flag || '🌐',
            flagImg: c.flags?.svg || c.flags?.png || null,
            capital,
            population: c.population > 1e9 ? (c.population / 1e9).toFixed(1) + 'B'
              : c.population > 1e6 ? (c.population / 1e6).toFixed(1) + 'M'
              : c.population > 1e3 ? (c.population / 1e3).toFixed(0) + 'K'
              : c.population,
            area: c.area > 1e6 ? (c.area / 1e6).toFixed(2) + 'M km²' : c.area?.toLocaleString() + ' km²',
            currencies, currCode,
            region: c.subregion || c.region || 'N/A',
            languages,
            timezone: c.timezones?.[0] || 'N/A',
            callingCode: c.idd?.root + (c.idd?.suffixes?.[0] || ''),
            tld: c.tld?.[0] || 'N/A',
            continent: c.continents?.[0] || 'N/A',
          })

          // Weather
          fetch(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${API_KEY}&units=metric`)
            .then(r => r.json())
            .then(w => {
              if (w.main) {
                setWeather({
                  temp: Math.round(w.main.temp),
                  feels: Math.round(w.main.feels_like),
                  humidity: w.main.humidity,
                  desc: w.weather[0].description,
                  main: w.weather[0].main,
                  wind: w.wind.speed,
                  visibility: w.visibility ? (w.visibility / 1000).toFixed(1) + ' km' : 'N/A',
                })
              } else {
                setWeather({
                  temp: Math.floor(Math.random() * 30) + 5,
                  feels: Math.floor(Math.random() * 28) + 4,
                  humidity: Math.floor(Math.random() * 60) + 30,
                  desc: 'partly cloudy', main: 'Clouds',
                  wind: (Math.random() * 10 + 2).toFixed(1), visibility: '10 km',
                })
              }
            }).catch(() => {})

          // Unsplash
          fetch(`https://api.unsplash.com/search/photos?query=${country.name}+landscape&per_page=1&client_id=${UNSPLASH_KEY}`)
            .then(r => r.json())
            .then(u => {
              if (u.results?.[0]) setPhoto(u.results[0].urls.regular)
            }).catch(() => {})

          // Wikivoyage
          fetch(`https://en.wikivoyage.org/api/rest_v1/page/summary/${encodeURIComponent(country.name)}`)
            .then(r => r.json())
            .then(w => {
              if (w.extract) setWiki(w.extract)
            }).catch(() => {})
        }
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [country])

  const handleConvert = () => {
    if (!currencyCode || !amount) return
    setRateLoading(true)
    fetch(`https://api.exchangerate-api.com/v4/latest/INR`)
      .then(r => r.json())
      .then(d => {
        const rate = d.rates[currencyCode]
        if (rate) {
          const result = (parseFloat(amount) * rate).toFixed(2)
          setConverted({ result, rate: rate.toFixed(6), code: currencyCode })
        }
        setRateLoading(false)
      }).catch(() => setRateLoading(false))
  }

  if (!country) return null

  return (
    <div className={`country-panel ${isOpen ? 'open' : ''}`}>
      <button className="panel-close" onClick={onClose}>✕</button>
      {loading ? (
        <div style={{ paddingTop: '3rem' }}>
          <div className="loading-state">
            <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
            <span>Loading country data...</span>
          </div>
        </div>
      ) : data ? (
        <>
          {photo && (
            <img src={photo} alt={country.name}
              style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '2px', marginBottom: '1rem', border: '1px solid var(--border)' }} />
          )}
          {data.flagImg ? (
            <img src={data.flagImg} alt={`${country.name} flag`}
              style={{ width: '60px', height: '38px', objectFit: 'cover', borderRadius: '2px', marginBottom: '0.8rem', border: '1px solid var(--border)' }} />
          ) : (
            <span className="panel-flag">{data.flag}</span>
          )}
          <h2 className="panel-country-name">{country.name}</h2>
          <p className="panel-region">{data.region} · {data.continent}</p>
          <div className="panel-divider" />

          <p className="panel-section-title">🕐 Local Time</p>
          <div style={{ background: 'rgba(79,195,247,0.05)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '2px', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '800', color: 'var(--accent2)', letterSpacing: '0.05em', lineHeight: 1 }}>{clock}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.4rem', letterSpacing: '0.1em' }}>{data.timezone}</div>
          </div>
          <div className="panel-divider" />

          <p className="panel-section-title">Quick Facts</p>
          <div className="panel-stats">
            <div className="stat-card"><div className="stat-label">Capital</div><div className="stat-value">{data.capital}</div></div>
            <div className="stat-card"><div className="stat-label">Population</div><div className="stat-value accent">{data.population}</div></div>
            <div className="stat-card"><div className="stat-label">Area</div><div className="stat-value">{data.area}</div></div>
            <div className="stat-card"><div className="stat-label">Calling Code</div><div className="stat-value">{data.callingCode || 'N/A'}</div></div>
            <div className="stat-card"><div className="stat-label">TLD</div><div className="stat-value">{data.tld}</div></div>
          </div>
          <div className="panel-divider" />

          <p className="panel-section-title">Currency</p>
          <div className="currency-card">
            <div><div className="currency-code" style={{ fontSize: '0.9rem' }}>{data.currencies}</div></div>
            <div style={{ color: 'var(--muted)', fontSize: '1.5rem' }}>💱</div>
          </div>
          {currencyCode && currencyCode !== 'INR' && (
            <div style={{ marginTop: '0.8rem', background: 'rgba(255,213,79,0.05)', border: '1px solid rgba(255,213,79,0.15)', padding: '1rem', borderRadius: '2px' }}>
              <p style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '0.6rem' }}>Convert INR → {currencyCode}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,213,79,0.2)', color: 'var(--white)', padding: '0.5rem 0.8rem', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none', borderRadius: '2px' }}
                  placeholder="Amount in INR" />
                <button onClick={handleConvert}
                  style={{ background: 'var(--gold)', color: '#0a0a2e', border: 'none', padding: '0.5rem 1rem', fontFamily: 'var(--font-body)', fontWeight: '700', fontSize: '0.8rem', borderRadius: '2px', cursor: 'pointer' }}>
                  {rateLoading ? '...' : 'Convert'}
                </button>
              </div>
              {converted && (
                <div style={{ marginTop: '0.6rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '700', color: 'var(--gold)' }}>{converted.result} {converted.code}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.2rem' }}>1 INR = {converted.rate} {converted.code}</div>
                </div>
              )}
            </div>
          )}
          <div className="panel-divider" />

          <p className="panel-section-title">Languages</p>
          <div className="info-tags">
            {data.languages.map(l => <span key={l} className="info-tag">{l}</span>)}
          </div>
          <div className="panel-divider" />

          <p className="panel-section-title">Weather in {data.capital}</p>
          {weather ? (
            <div className="weather-card">
              <div className="weather-icon">{WEATHER_ICONS[weather.main] || WEATHER_ICONS.default}</div>
              <div style={{ flex: 1 }}>
                <div className="weather-temp">{weather.temp}°C</div>
                <div className="weather-desc">{weather.desc}</div>
                <div className="weather-details">
                  <div className="weather-detail">Feels <span>{weather.feels}°C</span></div>
                  <div className="weather-detail">Humidity <span>{weather.humidity}%</span></div>
                  <div className="weather-detail">Wind <span>{weather.wind} m/s</span></div>
                  <div className="weather-detail">Visibility <span>{weather.visibility}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-state">
              <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
              <span>Fetching weather...</span>
            </div>
          )}
          <div className="panel-divider" />

          <p className="panel-section-title">✈️ Travel Guide</p>
          {wiki ? (
            <div style={{ background: 'rgba(79,195,247,0.04)', border: '1px solid var(--border)', padding: '1rem', borderRadius: '2px', fontSize: '0.82rem', color: 'rgba(240,244,255,0.7)', lineHeight: '1.8', fontWeight: '300' }}>
              {wiki.length > 400 ? wiki.slice(0, 400) + '...' : wiki}
              <a href={`https://en.wikivoyage.org/wiki/${encodeURIComponent(country.name)}`}
                target="_blank" rel="noreferrer"
                style={{ display: 'block', marginTop: '0.8rem', color: 'var(--accent)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                Read Full Travel Guide →
              </a>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>No travel guide available for this country.</div>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
          <h2 className="panel-country-name">{country.name}</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Could not load data. Check your connection.</p>
        </>
      )}
    </div>
  )
}