import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Screen1() {
  const [soupOfTheDay, setSoupOfTheDay] = useState('')
  const [menuItems, setMenuItems] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Soup
        const { data: soupData, error: soupError } = await supabase.from('daily_soup').select('name').eq('is_active', true).maybeSingle()
        if (soupData && !soupError) setSoupOfTheDay(soupData.name)

        // Menu items for screen 1
        const { data: items, error: itemsError } = await supabase.from('menu_items').select('*').eq('screen_id', 1).eq('is_active', true).order('sort_order', { ascending: true })
        if (items && !itemsError) {
          const grouped = items.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = []
            acc[item.section].push(item)
            return acc
          }, {})
          setMenuItems(grouped)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()

    // Subscriptions
    const soupChannel = supabase
      .channel('soup_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_soup' }, (payload) => {
        if (payload.new) setSoupOfTheDay(payload.new.name)
      })
      .subscribe()

    const menuChannel = supabase
      .channel('menu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(soupChannel)
      supabase.removeChannel(menuChannel)
    }
  }, [])

  return (
    <div className="screen">
      <div className="logo">Conte di Savoia</div>
      <div className="subtitle">Chicago • Est. 1948</div>

      <div className="columns">
        {Object.entries(menuItems).map(([section, items]) => (
          <div key={section}>
            {section === 'Soups & Salads' ? (
              <>
                <div className="section-header">{section}</div>
                <div className="menu-item">
                  <div className="menu-item-name">Soup of the Day</div>
                  <div className="menu-item-desc">{soupOfTheDay || 'Loading...'}</div>
                  <div className="menu-item-price">$4.99</div>
                </div>
              </>
            ) : (
              <div className="section-header">{section}</div>
            )}
            {items.map((item) => (
              <div key={item.id} className="menu-item">
                <div className="menu-item-name">{item.name}</div>
                <div className="menu-item-desc">{item.description || ''}</div>
                <div className="menu-item-price">{item.price_label}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="qr-section">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://fdwsc2005.github.io/restaurant-menu/" alt="QR Code" className="qr-code" />
        <div className="qr-text">Scan to Order</div>
      </div>
    </div>
  )
}

export default Screen1