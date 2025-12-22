import React, { useEffect, useMemo, useState } from 'react'

const BILLS_KEY = 'bills'
const PAYMENTS_KEY = 'paymentHistory'

const demoBills = (month) => {
  const m = month || new Date().toISOString().slice(0, 7)
  return [
    { id: 'e-1', name: 'Đin', amount: 75.25, month: m, type: 'variable', status: 'unpaid' },
    { id: 'w-1', name: 'Nước', amount: 32.6, month: m, type: 'variable', status: 'unpaid' },
    { id: 'g-1', name: 'Rác', amount: 12, month: m, type: 'fixed', status: 'unpaid' },
    { id: 'p-1', name: 'Bãi xe', amount: 25, month: m, type: 'fixed', status: 'unpaid' },
    { id: 'm-1', name: 'Quản lý chung', amount: 40, month: m, type: 'fixed', status: 'unpaid' },
  ]
}

function parseMonthToDueDate(monthStr) {
  const [y, m] = monthStr.split('-').map(Number)
  // due date = last day of the month
  const lastDay = new Date(y, m, 0)
  return lastDay
}

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [message, onClose])
  if (!message) return null
  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#1f7a1f', color: 'white', padding: '10px 14px', borderRadius: 6 }}>
      {message}
    </div>
  )
}

const Popup = ({ items, onClose }) => {
  if (!items || items.length === 0) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 8, width: 380 }}>
        <h3>Upcoming due bills</h3>
        <ul>
          {items.map(b => (
            <li key={b.id}>{b.name} — {b.month} — ${b.amount.toFixed(2)}</li>
          ))}
        </ul>
        <div style={{ textAlign: 'right' }}>
          <button onClick={onClose}>Dismiss</button>
        </div>
      </div>
    </div>
  )
}

const Bills = () => {
  const [bills, setBills] = useState([])
  const [toast, setToast] = useState('')
  const [showWarning, setShowWarning] = useState(false)
  const [warningItems, setWarningItems] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem(BILLS_KEY)
    let parsed = []
    try {
      parsed = raw ? JSON.parse(raw) : []
    } catch (e) {
      parsed = []
    }
    if (!parsed || parsed.length === 0) {
      const d = demoBills()
      localStorage.setItem(BILLS_KEY, JSON.stringify(d))
      setBills(d)
    } else {
      setBills(parsed)
    }
  }, [])

  useEffect(() => {
    if (!bills || bills.length === 0) return
    // check for unpaid bills near due date (within 3 days)
    const now = new Date()
    const near = bills.filter(b => b.status !== 'paid').filter(b => {
      const due = parseMonthToDueDate(b.month)
      const diff = (due - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 3
    })
    if (near.length > 0) {
      setWarningItems(near)
      setShowWarning(true)
    }
  }, [bills])

  const grouped = useMemo(() => {
    return bills.reduce((acc, b) => {
      acc[b.type] = acc[b.type] || []
      acc[b.type].push(b)
      return acc
    }, {})
  }, [bills])

  const saveBills = (next) => {
    setBills(next)
    localStorage.setItem(BILLS_KEY, JSON.stringify(next))
  }

  const markPaid = (bill) => {
    if (bill.status === 'paid') return
    const next = bills.map(b => b.id === bill.id ? { ...b, status: 'paid' } : b)
    saveBills(next)
    const historyRaw = localStorage.getItem(PAYMENTS_KEY)
    let history = []
    try { history = historyRaw ? JSON.parse(historyRaw) : [] } catch (e) { history = [] }
    history.push({ id: bill.id, name: bill.name, amount: bill.amount, month: bill.month, paidAt: new Date().toISOString() })
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(history))
    setToast(`Paid ${bill.name} — $${bill.amount.toFixed(2)}`)
  }

  return (
    <div style={{ padding: 18 }}>
      <h2>Bills</h2>

      {['variable', 'fixed'].map(type => (
        <div key={type} style={{ marginBottom: 18 }}>
          <h3 style={{ textTransform: 'capitalize' }}>{type} bills</h3>
          <div>
            {(grouped[type] || []).map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{b.month} • Due {parseMonthToDueDate(b.month).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 6 }}>${b.amount.toFixed(2)}</div>
                  <div>
                    {b.status === 'paid' ? (
                      <span style={{ color: 'green', fontWeight: 600 }}>Paid</span>
                    ) : (
                      <button onClick={() => markPaid(b)}>Mark as paid</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(grouped[type] || []).length === 0 && <div style={{ color: '#666' }}>No {type} bills</div>}
          </div>
        </div>
      ))}

      <Toast message={toast} onClose={() => setToast('')} />
      <Popup items={warningItems} onClose={() => setShowWarning(false)} />
    </div>
  )
}

export default Bills
