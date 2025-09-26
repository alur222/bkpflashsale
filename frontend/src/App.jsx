import SaleStatus from './components/SaleStatus.jsx'
import BuyForm from './components/BuyForm.jsx'
import MyPurchase from './components/MyPurchase.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BKP Inventory Sale
          </h1>
          <p className="text-gray-600">
            Limited time offer - Don't miss out!
          </p>
        </div>

        <div className="flex w-full gap-2 justify-center">
          <div className="items-center w-1/3">
            <SaleStatus />
          </div>
          <div className="flex-col w-1/3">
            <BuyForm />
            <MyPurchase />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App