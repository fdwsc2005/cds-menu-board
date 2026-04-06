import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Screen3() {
  const [menuItems, setMenuItems] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Menu items for screen 3
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('screen_id', 3)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
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

    const channel = supabase
      .channel('menu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchData()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div className="screen">
      <div className="columns">
        {Object.entries(menuItems).map(([section, items]) => (
          <div key={section}>
            <div className="section-header">{section}</div>
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

export default Screen3