import { useState } from 'react'

export function useModalStates() {
  const [isStationModalOpen, setIsStationModalOpen] = useState(false)
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false)
  const [isSalesDateModalOpen, setIsSalesDateModalOpen] = useState(false)
  const [isStationSummaryModalOpen, setIsStationSummaryModalOpen] = useState(false)
  const [isFarmerSummaryModalOpen, setIsFarmerSummaryModalOpen] = useState(false)

  return {
    // State
    isStationModalOpen,
    isBuyerModalOpen,
    isSalesDateModalOpen,
    isStationSummaryModalOpen,
    isFarmerSummaryModalOpen,
    
    // Actions
    openStationModal: () => setIsStationModalOpen(true),
    closeStationModal: () => setIsStationModalOpen(false),
    
    openBuyerModal: () => setIsBuyerModalOpen(true),
    closeBuyerModal: () => setIsBuyerModalOpen(false),
    
    openSalesDateModal: () => setIsSalesDateModalOpen(true),
    closeSalesDateModal: () => setIsSalesDateModalOpen(false),
    
    openStationSummaryModal: () => setIsStationSummaryModalOpen(true),
    closeStationSummaryModal: () => setIsStationSummaryModalOpen(false),
    
    openFarmerModal: () => setIsFarmerSummaryModalOpen(true),
    closeFarmerModal: () => setIsFarmerSummaryModalOpen(false),
  }
}