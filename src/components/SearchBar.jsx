import { useEffect, useRef, useState } from 'react'

const ALL_COUNTRIES = [
  'India', 'United States', 'China', 'Brazil', 'Russia',
  'Australia', 'Japan', 'Germany', 'France', 'Canada',
  'United Kingdom', 'Italy', 'South Africa', 'Mexico', 'Argentina',
  'Egypt', 'Nigeria', 'Saudi Arabia', 'Indonesia', 'Turkey',
  'Pakistan', 'Bangladesh', 'Ethiopia', 'Philippines', 'Vietnam',
  'Thailand', 'Iran', 'Ukraine', 'Colombia', 'Spain',
  'Kenya', 'Algeria', 'Sudan', 'Iraq', 'Afghanistan',
  'Poland', 'Morocco', 'Angola', 'Ghana', 'Peru',
  'Nepal', 'Sri Lanka', 'New Zealand', 'Portugal', 'Sweden',
  'Norway', 'Denmark', 'Finland', 'Switzerland', 'Netherlands',
  'Belgium', 'Austria', 'Greece', 'Czech Republic', 'Hungary',
  'Israel', 'Singapore', 'Malaysia', 'Myanmar', 'Cambodia',
  'Chile', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay',
  'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Guatemala',
  'Jordan', 'Lebanon', 'Syria', 'Yemen', 'Oman',
  'Qatar', 'Kuwait', 'Bahrain', 'United Arab Emirates', 'Kazakhstan',
  'Uzbekistan', 'Turkmenistan', 'Tanzania', 'Uganda', 'Rwanda',
  'South Korea', 'Venezuela', 'Tunisia', 'Libya', 'Somalia',
  'Zimbabwe', 'Zambia', 'Mozambique', 'Madagascar', 'Cameroon',
  'Ivory Coast', 'Niger', 'Burkina Faso', 'Mali', 'Senegal',
]

export default function SearchBar({ onCountrySelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (query.length < 1) { setResults([]); return }
    const filtered = ALL_COUNTRIES.filter(c =>
      c.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6)
    setResults(filtered)
  }, [query])

  const handleSelect = (country) => {
    onCountrySelect({ name: country })
    setQuery('')
    setResults([])
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0])
    }
    if (e.key === 'Escape') {
      setQuery('')
      setResults([])
      inputRef.current?.blur()
    }
  }

  return (
    <div className="search-wrap">
      <p className="search-label">🔍 Search Country</p>
      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          ref={inputRef}
          className="search-input"
          type="text"
          placeholder="e.g. India, France, Japan..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
        />
      </div>
      {results.length > 0 && focused && (
        <div className="search-results">
          {results.map((country) => (
            <div
              key={country}
              className="search-result-item"
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(country)
              }}
            >
              🌐 {country}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}