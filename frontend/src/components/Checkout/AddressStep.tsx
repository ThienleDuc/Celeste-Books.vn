// ./User/AddressSelector.tsx
import React, { useState } from 'react';
import { 
  type AddressFull, 
  formatPhoneNumber, 
  sampleAddresses,
  getAddressFull
} from '../../models/User/address.model';

interface AddressSelectorProps {
  userId: string;
  selectedAddressId?: number;
  onSelectAddress: (address: AddressFull | null) => void;
  defaultAddressId?: number;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  userId,
  selectedAddressId,
  onSelectAddress
}) => {
  // State cho việc mở popup chọn địa chỉ
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [tempSelectedAddressId, setTempSelectedAddressId] = useState<number | undefined>(selectedAddressId);

  // Lọc địa chỉ theo userId và chuyển đổi sang AddressFull
  const userAddressesFull = sampleAddresses
    .filter(address => address.userId === userId)
    .map(getAddressFull);

  // Tìm địa chỉ mặc định
  const defaultAddress = userAddressesFull.find(address => address.isDefault);
  
  // Tìm địa chỉ đang được chọn (ưu tiên selectedAddressId, nếu không có thì lấy default)
  const selectedAddress = selectedAddressId 
    ? userAddressesFull.find(a => a.id === selectedAddressId)
    : defaultAddress;

  // Kiểm tra xem có từ 2 địa chỉ trở lên không
  const hasMultipleAddresses = userAddressesFull.length >= 2;
  
  // Kiểm tra xem đã chọn địa chỉ khác địa chỉ hiện tại chưa
  const hasChangedSelection = tempSelectedAddressId !== selectedAddress?.id;

  // Xử lý mở popup chọn địa chỉ
  const handleOpenPopup = () => {
    setTempSelectedAddressId(selectedAddress?.id);
    setShowAddressPopup(true);
  };

  // Xử lý chọn địa chỉ tạm thời trong popup
  const handleTempSelectAddress = (address: AddressFull) => {
    setTempSelectedAddressId(address.id);
  };

  // Xử lý xác nhận chọn địa chỉ
  const handleConfirmSelection = () => {
    if (tempSelectedAddressId && hasChangedSelection) {
      const selected = userAddressesFull.find(a => a.id === tempSelectedAddressId);
      if (selected) {
        onSelectAddress(selected);
      }
    }
    setShowAddressPopup(false);
  };

  // Xử lý hủy chọn địa chỉ
  const handleCancelSelection = () => {
    setTempSelectedAddressId(selectedAddress?.id);
    setShowAddressPopup(false);
  };

  if (userAddressesFull.length === 0) {
    return (
      <div className="address-selector-empty">
        <div className="address-empty-content">
          <div>
            <div className="address-empty-title">Không có địa chỉ</div>
            <div className="address-empty-subtitle">Vui lòng thêm địa chỉ giao hàng</div>
          </div>
          <button className="address-add-btn">
            <i className="bi bi-plus"></i>
            Thêm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="address-selector-container">
      {/* Hiển thị địa chỉ mặc định/đã chọn trên 1 dòng */}
      <div className="address-display">
        <div className="address-display-content">
          <div className="address-info-container">
            {/* Thông tin địa chỉ */}
            <div className="address-info">
              <div className="address-name-row">
                <span className="address-receiver-name">
                  {selectedAddress?.receiverName}
                </span>
                {selectedAddress?.isDefault && (
                  <span className="address-default-badge">
                    Mặc định
                  </span>
                )}
              </div>
              
              <div className="address-details-row">
                <span className="address-phone">
                  <i className="bi bi-telephone address-icon"></i>
                  {selectedAddress ? formatPhoneNumber(selectedAddress.phone) : ''}
                </span>
                <span className="address-street">
                  <i className="bi bi-geo-alt address-icon"></i>
                  {selectedAddress?.streetAddress}
                </span>
              </div>
            </div>
            
            {/* Nút thay đổi - chỉ hiển thị nếu có từ 2 địa chỉ trở lên */}
            {hasMultipleAddresses && (
              <button
                onClick={handleOpenPopup}
                className="address-change-btn"
              >
                <i className="bi bi-pencil address-change-icon"></i>
                Thay đổi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Popup chọn địa chỉ - absolute và nhỏ hơn */}
      {showAddressPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="address-popup-backdrop"
            onClick={handleCancelSelection}
          />
          
          {/* Popup container */}
          <div className="address-popup-container">
            <div className="address-popup">
              {/* Header popup */}
              <div className="address-popup-header">
                <div className="address-popup-title">
                  <i className="bi bi-geo-alt address-popup-title-icon"></i>
                  <h3 className="address-popup-title-text">Chọn địa chỉ giao hàng</h3>
                </div>
                <button
                  onClick={handleCancelSelection}
                  className="address-popup-close-btn"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              
              {/* Body popup - Danh sách địa chỉ */}
              <div className="address-popup-body">
                <div className="address-list">
                  {userAddressesFull.map((address) => (
                    <div
                      key={address.id}
                      className={`address-item ${tempSelectedAddressId === address.id ? 'address-item-selected' : 'address-item-normal'}`}
                      onClick={() => handleTempSelectAddress(address)}
                    >
                      <div className="address-item-content">
                        <div className="address-item-info">
                          <div className="address-item-name-row">
                            <span className="address-item-receiver-name">{address.receiverName}</span>
                            {address.isDefault && (
                              <span className="address-item-default-badge">
                                Mặc định
                              </span>
                            )}
                          </div>
                          
                          <div className="address-item-details">
                            <div className="address-item-phone">
                              <i className="bi bi-telephone"></i>
                              <span>{formatPhoneNumber(address.phone)}</span>
                            </div>
                            <div className="address-item-street">
                              <i className="bi bi-geo-alt"></i>
                              <span>{address.streetAddress}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="address-item-check">
                          {tempSelectedAddressId === address.id && (
                            <i className="bi bi-check-circle-fill address-item-check-icon"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer popup - Nút xác nhận/hủy */}
              {/* Chỉ hiển thị nút xác nhận/hủy nếu có từ 2 địa chỉ trở lên VÀ đã thay đổi lựa chọn */}
              {hasMultipleAddresses && hasChangedSelection && (
                <div className="address-popup-footer">
                  <button
                    onClick={handleCancelSelection}
                    className="address-popup-cancel-btn"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    className="address-popup-confirm-btn"
                  >
                    <i className="bi bi-check-lg address-popup-confirm-icon"></i>
                    Xác nhận
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