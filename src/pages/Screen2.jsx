import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Screen2() {
  const [menuItems, setMenuItems] = useState({})
  const [addons, setAddons] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Menu items for screen 2
        const { data: items, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('screen_id', 2)
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

        // Add-ons
        const { data: addonsData, error: addonsError } = await supabase
          .from('addons')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (addonsData && !addonsError) setAddons(addonsData)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()

    const menuChannel = supabase
      .channel('menu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        fetchData()
      })
      .subscribe()

    const addonsChannel = supabase
      .channel('addons_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'addons' }, () => {
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(menuChannel)
      supabase.removeChannel(addonsChannel)
    }
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

        <div className="add-ons">
          <div className="section-header">Add-ons (Extra)</div>
          {addons.map((addon) => (
            <div key={addon.id} className="menu-item">
              <div className="menu-item-name">{addon.name}</div>
              {addon.note && <div className="menu-item-desc">{addon.note}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="special-banner">$7.99 Special</div>

      <div className="qr-section">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=https://fdwsc2005.github.io/restaurant-menu/" alt="QR Code" className="qr-code" />
        <div className="qr-text">Scan to Order</div>
      </div>
    </div>
  )
}

export default Screen2