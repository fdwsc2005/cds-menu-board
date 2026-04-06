import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('soup')
  const [soup, setSoup] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [addons, setAddons] = useState([])
  const [newAddon, setNewAddon] = useState({ name: '', note: '' })

  useEffect(() => {
    if (isAuthenticated) {
      fetchSoup()
      fetchMenuItems()
      fetchAddons()
    }
  }, [isAuthenticated])

  const fetchSoup = async () => {
    try {
      const { data, error } = await supabase.from('daily_soup').select('name').eq('is_active', true).maybeSingle()
      if (data && !error) setSoup(data.name)
    } catch (err) {
      console.error('Error fetching soup:', err)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from('menu_items').select('*').eq('is_active', true).order('screen_id', { ascending: true }).order('sort_order', { ascending: true })
      if (data && !error) setMenuItems(data)
    } catch (err) {
      console.error('Error fetching menu items:', err)
    }
  }

  const fetchAddons = async () => {
    try {
      const { data, error } = await supabase.from('addons').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      if (data && !error) setAddons(data)
    } catch (err) {
      console.error('Error fetching addons:', err)
    }
  }

  const handleLogin = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect password')
    }
  }

  const updateSoup = async () => {
    await supabase.from('daily_soup').upsert({ id: 1, name: soup, is_active: true })
    alert('Soup updated')
  }

  const updateMenuItem = async (id, field, value) => {
    await supabase.from('menu_items').update({ [field]: value }).eq('id', id)
    fetchMenuItems()
  }

  const addAddon = async () => {
    if (newAddon.name) {
      await supabase.from('addons').insert({ name: newAddon.name, note: newAddon.note || '', is_active: true })
      setNewAddon({ name: '', note: '' })
      fetchAddons()
    }
  }

  const deleteAddon = async (id) => {
    await supabase.from('addons').update({ is_active: false }).eq('id', id)
    fetchAddons()
  }

  return (
    <div className="min-h-screen bg-[#1a2e1a] text-[#f5f0e8] p-4 font-['Lato']">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#c9a84c] font-['Playfair_Display']">Admin Panel</h1>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="flex mb-6 border-b border-[#c9a84c]">
          <button
            onClick={() => setActiveTab('soup')}
            className={`px-4 py-2 ${activeTab === 'soup' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-[#f5f0e8]'}`}
          >
            Soup of the Day
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 ${activeTab === 'menu' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-[#f5f0e8]'}`}
          >
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('addons')}
            className={`px-4 py-2 ${activeTab === 'addons' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-[#f5f0e8]'}`}
          >
            Add-ons
          </button>
        </div>

        {activeTab === 'soup' && (
          <div className="bg-[#0f1a0f] p-6 rounded">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 font-['Playfair_Display']">Soup of the Day</h2>
            <input
              type="text"
              value={soup}
              onChange={(e) => setSoup(e.target.value)}
              className="w-full p-3 mb-4 text-[#0f1a0f] bg-[#f5f0e8] rounded text-lg"
              placeholder="Enter today's soup"
            />
            <button onClick={updateSoup} className="bg-[#c9a84c] text-[#1a2e1a] px-6 py-3 rounded font-semibold">Update Soup</button>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="bg-[#0f1a0f] p-6 rounded">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 font-['Playfair_Display']">Menu Items</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {menuItems.map((item) => (
                <div key={item.id} className="border border-[#c9a84c] p-4 rounded">
                  <div className="text-sm text-[#c9a84c] mb-2">Screen {item.screen_id} • {item.section}</div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                      className="p-2 text-[#0f1a0f] bg-[#f5f0e8] rounded text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateMenuItem(item.id, 'description', e.target.value)}
                      className="p-2 text-[#0f1a0f] bg-[#f5f0e8] rounded text-sm"
                      placeholder="Description"
                    />
                    <input
                      type="text"
                      value={item.price_label || ''}
                      onChange={(e) => updateMenuItem(item.id, 'price_label', e.target.value)}
                      className="p-2 text-[#0f1a0f] bg-[#f5f0e8] rounded text-sm"
                      placeholder="Price Label"
                    />
                    <input
                      type="number"
                      value={item.sort_order || 0}
                      onChange={(e) => updateMenuItem(item.id, 'sort_order', parseInt(e.target.value))}
                      className="p-2 text-[#0f1a0f] bg-[#f5f0e8] rounded text-sm"
                      placeholder="Sort Order"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'addons' && (
          <div className="bg-[#0f1a0f] p-6 rounded">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 font-['Playfair_Display']">Add-ons</h2>
            <ul className="space-y-2 mb-6">
              {addons.map((addon) => (
                <li key={addon.id} className="flex justify-between items-center p-2 border border-[#c9a84c] rounded">
                  <div>
                    <div className="font-semibold">{addon.name}</div>
                    {addon.note && <div className="text-sm text-[#c9a84c]">{addon.note}</div>}
                  </div>
                  <button onClick={() => deleteAddon(addon.id)} className="bg-red-600 text-white px-3 py-1 rounded">Remove</button>
                </li>
              ))}
            </ul>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newAddon.name}
                onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                className="flex-1 p-3 text-[#0f1a0f] bg-[#f5f0e8] rounded"
                placeholder="Addon name"
              />
              <input
                type="text"
                value={newAddon.note || ''}
                onChange={(e) => setNewAddon({ ...newAddon, note: e.target.value })}
                className="flex-1 p-3 text-[#0f1a0f] bg-[#f5f0e8] rounded"
                placeholder="Note (optional)"
              />
              <button onClick={addAddon} className="bg-[#c9a84c] text-[#1a2e1a] px-6 py-3 rounded font-semibold">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin