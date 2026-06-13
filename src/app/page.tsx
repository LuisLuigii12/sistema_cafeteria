import MesasGrid from '@/components/home/MesasGrid'
import TopNav from '@/components/shared/TopNav'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-cream)' }}>
      <TopNav />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: 'var(--espresso)' }}>
              Mesas
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 2 }}>
              Toca una mesa para registrar una orden
            </p>
          </div>
        </div>
        <MesasGrid />
      </main>
    </div>
  )
}
