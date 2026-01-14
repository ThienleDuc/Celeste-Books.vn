// ./User/AddressSelector.tsx
import React, { useState } from 'react';
import type { AddressFull } from '../../models/User/address.model';

interface AddressSelectorProps {
  userId: string;
  selectedAddressId: number | undefined;
  onSelectAddress: (address: AddressFull | null) => void;
  addresses: AddressFull[]; // Nhận từ trang cha
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  selectedAddressId,
  onSelectAddress,
  addresses
}) => {
  // 1. State quản lý Popup
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState<number | undefined>(selectedAddressId);

  // 2. Tìm địa chỉ đang hiển thị (Dùng snake_case khớp API)
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) 
    || addresses.find((a: any) => a.is_default === 1);

  // 3. Logic kiểm tra
  const hasMultipleAddresses = addresses.length >= 2;
  const hasChangedSelection = tempSelectedAddressId !== selectedAddress?.id;

  const handleOpenPopup = () => {
    setTempSelectedAddressId(selectedAddress?.id);
    setShowAddressPopup(true);
  };

  const handleConfirmSelection = () => {
    const selected = addresses.find(a => a.id === tempSelectedAddressId);
    if (selected) {
      onSelectAddress(selected);
    }
    setShowAddressPopup(false);
  };

  const handleCancelSelection = () => {
    setTempSelectedAddressId(selectedAddress?.id);
    setShowAddressPopup(false);
  };

  if (addresses.length === 0) {
    return (
      <div className="address-selector-empty">
        <div className="address-empty-content">
          <div>
            <div className="address-empty-title">Không có địa chỉ</div>
            <div className="address-empty-subtitle">Vui lòng thêm địa chỉ giao hàng</div>
          </div>
          <button className="address-add-btn"><i className="bi bi-plus"></i> Thêm</button>
        </div>
      </div>
    );
  }

  return (
    <div className="address-selector-container">
      {/* HIỂN THỊ ĐỊA CHỈ TRÊN 1 DÒNG (Dùng Class của bản bạn yêu cầu) */}
      <div className="address-display">
        <div className="address-display-content">
          <div className="address-info-container">
            <div className="address-info">
              <div className="address-name-row">
                <span className="address-receiver-name">
                  {(selectedAddress as any)?.receiver_name}
                </span>
                {(selectedAddress as any)?.is_default === 1 && (
                  <span className="address-default-badge">Mặc định</span>
                )}
              </div>
              
              <div className="address-details-row">
                <span className="address-phone">
                  <i className="bi bi-telephone address-icon"></i>
                  {(selectedAddress as any)?.phone}
                </span>
                <span className="address-street">
                  <i className="bi bi-geo-alt address-icon"></i>
                  {(selectedAddress as any)?.street_address}
                </span>
              </div>
            </div>
            
            {hasMultipleAddresses && (
              <button onClick={handleOpenPopup} className="address-change-btn">
                <i className="bi bi-pencil address-change-icon"></i> Thay đổi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* POPUP CHỌN ĐỊA CHỈ (Dùng đúng cấu trúc Class cũ) */}
      {showAddressPopup && (
        <>
          <div className="address-popup-backdrop" onClick={handleCancelSelection} />
          
          <div className="address-popup-container">
            <div className="address-popup">
              <div className="address-popup-header">
                <div className="address-popup-title">
                  <i className="bi bi-geo-alt address-popup-title-icon"></i>
                  <h3 className="address-popup-title-text">Chọn địa chỉ giao hàng</h3>
                </div>
                <button onClick={handleCancelSelection} className="address-popup-close-btn">
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              
              <div className="address-popup-body">
                <div className="address-list">
                  {addresses.map((addr: any) => (
                    <div
                      key={addr.id}
                      className={`address-item ${tempSelectedAddressId === addr.id ? 'address-item-selected' : 'address-item-normal'}`}
                      onClick={() => setTempSelectedAddressId(addr.id)}
                    >
                      <div className="address-item-content">
                        <div className="address-item-info">
                          <div className="address-item-name-row">
                            <span className="address-item-receiver-name">{addr.receiver_name}</span>
                            {addr.is_default === 1 && (
                              <span className="address-item-default-badge">Mặc định</span>
                            )}
                          </div>
                          
                          <div className="address-item-details">
                            <div className="address-item-phone">
                              <i className="bi bi-telephone"></i> <span>{addr.phone}</span>
                            </div>
                            <div className="address-item-street">
                              <i className="bi bi-geo-alt"></i> <span>{addr.street_address}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="address-item-check">
                          {tempSelectedAddressId === addr.id && (
                            <i className="bi bi-check-circle-fill address-item-check-icon"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút xác nhận khi có thay đổi */}
              {hasChangedSelection && (
                <div className="address-popup-footer">
                  <button onClick={handleCancelSelection} className="address-popup-cancel-btn">Hủy</button>
                  <button onClick={handleConfirmSelection} className="address-popup-confirm-btn">
                    <i className="bi bi-check-lg address-popup-confirm-icon"></i> Xác nhận
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddressSelector;