// src/components/users/AddressSelect.tsx
import React, { useState, useEffect } from 'react';
import { Form, Spinner, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { locationApi } from '../../api/locations.api';
import type { Province, Commune } from '../../api/locations.api';

interface AddressSelectProps {
  selectedProvinceId: string;
  selectedCommuneId: string;
  onProvinceSelect: (id: string, item?: Province) => void;
  onCommuneSelect: (id: string, item?: Commune) => void;
  disabled?: boolean;
  initialCommuneId?: number;
}

const AddressSelect: React.FC<AddressSelectProps> = ({
  selectedProvinceId,
  selectedCommuneId,
  onProvinceSelect,
  onCommuneSelect,
  disabled = false,
  initialCommuneId 
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(false);
  
  // Pagination states
  const [provinceSearch, setProvinceSearch] = useState('');
  const [provincePage, setProvincePage] = useState(1);
  const [provinceTotalPages, setProvinceTotalPages] = useState(1);
  const [provinceTotalItems, setProvinceTotalItems] = useState(0);
  
  const [communeSearch, setCommuneSearch] = useState('');
  const [communePage, setCommunePage] = useState(1);
  const [communeTotalPages, setCommuneTotalPages] = useState(1);
  const [communeTotalItems, setCommuneTotalItems] = useState(0);

  // State để theo dõi đã load initial data chưa
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Kiểm tra và xử lý initial data từ props
  useEffect(() => {
    const processInitialData = async () => {
        // Chuyển đổi sang boolean rõ ràng
        const provinceIdNotEmpty = !!selectedProvinceId && selectedProvinceId.trim() !== '';
        const communeIdNotEmpty = !!selectedCommuneId && selectedCommuneId.trim() !== '';
        const hasValidInitialCommuneId = !!initialCommuneId && initialCommuneId > 0;

        if (!provinceIdNotEmpty && !communeIdNotEmpty && hasValidInitialCommuneId) {
        if (!initialDataLoaded) {
            await fetchProvinceFromCommuneId(initialCommuneId);
            setInitialDataLoaded(true);
        }
        }
        else if (provinceIdNotEmpty && !communeIdNotEmpty && !initialDataLoaded) {
        await loadProvinceAndCommunes();
        setInitialDataLoaded(true);
        }
        else if (provinceIdNotEmpty && communeIdNotEmpty && !initialDataLoaded) {
        await loadSelectedProvinceAndCommune();
        setInitialDataLoaded(true);
        }
    };

    if (!initialDataLoaded && !disabled) {
        processInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProvinceId, selectedCommuneId, initialCommuneId, initialDataLoaded, disabled]);

  // Load province từ commune_id (khi chỉ có initialCommuneId)
  const fetchProvinceFromCommuneId = async (communeId: number) => {
    try {
      setLoadingInitialData(true);
      const response = await locationApi.getCommuneDetail(communeId);
      
      if (response.data.success && response.data.data) {
        const communeData = response.data.data;
        
        // Set tỉnh từ commune detail
        if (communeData.province_id) {
          const provinceId = communeData.province_id.toString();
          
          // Load thông tin tỉnh
          const provinceResponse = await locationApi.getAllProvinces({});
          const provincesList = locationApi.extractProvinces(provinceResponse);
          
          const selectedProvince = provincesList.find(p => p.id === communeData.province_id);
          
          // Gọi callback để set province
          onProvinceSelect(provinceId, selectedProvince);
          
          // Sau đó load communes của tỉnh này
          await fetchCommunesByProvince(communeData.province_id, 1, '', communeId);
        }
      }
    } catch (error) {
      console.error('Fetch province from commune error:', error);
    } finally {
      setLoadingInitialData(false);
    }
  };

  // Load province và communes khi chỉ có selectedProvinceId từ props
  const loadProvinceAndCommunes = async () => {
    try {
      setLoadingInitialData(true);
      const provinceId = parseInt(selectedProvinceId);
      
      // Load thông tin tỉnh
      const provinceResponse = await locationApi.getAllProvinces({});
      const provincesList = locationApi.extractProvinces(provinceResponse);
      const selectedProvince = provincesList.find(p => p.id === provinceId);
      
      // Gọi callback để set province (nếu cần)
      onProvinceSelect(selectedProvinceId, selectedProvince);
      
      // Load communes của tỉnh
      await fetchCommunesByProvince(provinceId, 1, '');
      
    } catch (error) {
      console.error('Load province and communes error:', error);
    } finally {
      setLoadingInitialData(false);
    }
  };

  // Load cả province và commune khi có đầy đủ từ props
  const loadSelectedProvinceAndCommune = async () => {
    try {
      setLoadingInitialData(true);
      const provinceId = parseInt(selectedProvinceId);
      const communeId = parseInt(selectedCommuneId);
      
      // Load thông tin tỉnh
      const provinceResponse = await locationApi.getAllProvinces({});
      const provincesList = locationApi.extractProvinces(provinceResponse);
      const selectedProvince = provincesList.find(p => p.id === provinceId);
      
      // Gọi callback để set province (nếu cần)
      onProvinceSelect(selectedProvinceId, selectedProvince);
      
      // Load communes của tỉnh và chọn commune
      await fetchCommunesByProvince(provinceId, 1, '', communeId);
      
    } catch (error) {
      console.error('Load selected province and commune error:', error);
    } finally {
      setLoadingInitialData(false);
    }
  };

  // Fetch communes với phân trang và tự động chọn commune nếu có
  const fetchCommunesByProvince = async (
    provinceId: number, 
    page = 1, 
    search = communeSearch,
    selectCommuneId?: number
  ) => {
    try {
      setLoadingCommunes(true);
      
      const params = {
        search: search,
        page: page,
        per_page: 5
      };

      const response = await locationApi.getCommunesByProvince(provinceId, params);
      
      if (response.data.success && response.data.data) {
        const communesData = response.data.data.data || [];
        setCommunes(communesData);
        setCommuneTotalPages(response.data.data.pagination?.last_page || 1);
        setCommuneTotalItems(response.data.data.pagination?.total || 0);
        setCommunePage(page);
        
        // Nếu có communeId cần chọn, tìm và chọn nó
        if (selectCommuneId && communesData.length > 0) {
          const foundCommune = communesData.find(c => c.id === selectCommuneId);
          if (foundCommune) {
            onCommuneSelect(foundCommune.id.toString(), foundCommune);
          }
        } else if (selectedCommuneId && !selectCommuneId) {
          // Nếu có selectedCommuneId từ props nhưng chưa được chọn
          const foundCommune = communesData.find(c => c.id === parseInt(selectedCommuneId));
          if (foundCommune) {
            onCommuneSelect(foundCommune.id.toString(), foundCommune);
          }
        }
      } else {
        setCommunes([]);
        setCommuneTotalPages(1);
        setCommuneTotalItems(0);
      }
      
    } catch (error) {
      console.error('Fetch communes error:', error);
      setCommunes([]);
      setCommuneTotalPages(1);
      setCommuneTotalItems(0);
    } finally {
      setLoadingCommunes(false);
    }
  };

  // Fetch provinces với phân trang
  const fetchProvinces = async (page = 1, search = provinceSearch) => {
    if (disabled) {
      setProvinces([]);
      return;
    }

    try {
      setLoadingProvinces(true);
      
      const params = {
        search: search,
        page: page,
        per_page: 5
      };

      const response = await locationApi.getAllProvinces(params);
      
      if (response.data.success && response.data.data) {
        setProvinces(response.data.data.data || []);
        setProvinceTotalPages(response.data.data.pagination?.last_page || 1);
        setProvinceTotalItems(response.data.data.pagination?.total || 0);
        setProvincePage(page);
        
        // Nếu có selectedProvinceId từ props, đảm bảo nó được chọn trong dropdown
        if (selectedProvinceId && !initialDataLoaded) {
          const foundProvince = response.data.data.data?.find(p => p.id.toString() === selectedProvinceId);
          if (foundProvince) {
            onProvinceSelect(selectedProvinceId, foundProvince);
          }
        }
      } else {
        setProvinces([]);
        setProvinceTotalPages(1);
        setProvinceTotalItems(0);
      }
      
    } catch (error) {
      console.error('Fetch provinces error:', error);
      setProvinces([]);
      setProvinceTotalPages(1);
      setProvinceTotalItems(0);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Fetch communes khi selectedProvinceId thay đổi từ user interaction
  const fetchCommunes = async (page = 1, search = communeSearch) => {
    if (!selectedProvinceId || disabled) {
      setCommunes([]);
      if (selectedProvinceId) {
        onCommuneSelect('');
      }
      return;
    }

    try {
      const provinceId = parseInt(selectedProvinceId);
      await fetchCommunesByProvince(provinceId, page, search);
      
    } catch (error) {
      console.error('Fetch communes error:', error);
      setCommunes([]);
      setCommuneTotalPages(1);
      setCommuneTotalItems(0);
    }
  };

  // Initial fetch provinces
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProvinces(1, provinceSearch);
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceSearch, disabled]);

  // Fetch communes khi selectedProvinceId thay đổi từ user interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedProvinceId && initialDataLoaded) {
        fetchCommunes(1, communeSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceId, communeSearch, disabled, initialDataLoaded]);

  // Reset commune pagination khi tỉnh thay đổi
  useEffect(() => {
    if (selectedProvinceId) {
      setCommunePage(1);
    }
  }, [selectedProvinceId]);

  const handleProvinceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    if (!provinceId) {
      onProvinceSelect('');
      return;
    }

    const selectedProvince = provinces.find(province => province.id.toString() === provinceId);
    onProvinceSelect(provinceId, selectedProvince);
    
    // Reset commune khi chọn tỉnh mới
    onCommuneSelect('');
    setCommunePage(1);
    setCommuneSearch('');
  };

  const handleCommuneSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const communeId = e.target.value;
    if (!communeId) {
      onCommuneSelect('');
      return;
    }

    const selectedCommune = communes.find(commune => commune.id.toString() === communeId);
    onCommuneSelect(communeId, selectedCommune);
  };

  // Province pagination handlers
  const handlePrevProvincePage = () => {
    if (provincePage > 1) {
      fetchProvinces(provincePage - 1, provinceSearch);
    }
  };

  const handleNextProvincePage = () => {
    if (provincePage < provinceTotalPages) {
      fetchProvinces(provincePage + 1, provinceSearch);
    }
  };

  // Commune pagination handlers
  const handlePrevCommunePage = () => {
    if (communePage > 1) {
      fetchCommunes(communePage - 1, communeSearch);
    }
  };

  const handleNextCommunePage = () => {
    if (communePage < communeTotalPages) {
      fetchCommunes(communePage + 1, communeSearch);
    }
  };

  const getSelectedProvinceLabel = () => {
    if (!selectedProvinceId) return '';
    
    const selectedProvince = provinces.find(province => province.id.toString() === selectedProvinceId);
    return selectedProvince?.name || '';
  };

  const getSelectedCommuneLabel = () => {
    if (!selectedCommuneId) return '';
    
    const selectedCommune = communes.find(commune => commune.id.toString() === selectedCommuneId);
    return selectedCommune?.name || '';
  };

  const handleProvinceSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProvinceSearch(value);
    setProvincePage(1);
    
    const timer = setTimeout(() => {
      fetchProvinces(1, value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleCommuneSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCommuneSearch(value);
    setCommunePage(1);
    
    const timer = setTimeout(() => {
      fetchCommunes(1, value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const getProvincePaginationInfo = () => {
    const start = (provincePage - 1) * 5 + 1;
    const end = Math.min(provincePage * 5, provinceTotalItems);
    return `Hiển thị ${start}-${end} / ${provinceTotalItems}`;
  };

  const getCommunePaginationInfo = () => {
    const start = (communePage - 1) * 5 + 1;
    const end = Math.min(communePage * 5, communeTotalItems);
    return `Hiển thị ${start}-${end} / ${communeTotalItems}`;
  };

  // Hiển thị loading khi đang load initial data
  if (loadingInitialData) {
    return (
      <div className="text-center py-3">
        <Spinner animation="border" variant="primary" size="sm" />
        <div className="mt-2 text-muted">Đang tải thông tin địa chỉ...</div>
      </div>
    );
  }

  return (
    <div>
      <Row>
        {/* Province Selection */}
        <Col md={6}>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">
                Tỉnh/Thành phố <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex align-items-center">
                <small className="text-muted me-2">
                  {getProvincePaginationInfo()}
                </small>
                <ButtonGroup size="sm">
                  <Button
                    variant="outline-secondary"
                    onClick={handlePrevProvincePage}
                    disabled={disabled || loadingProvinces || provincePage <= 1}
                    title="Trang trước"
                  >
                    <i className="bi bi-chevron-up"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleNextProvincePage}
                    disabled={disabled || loadingProvinces || provincePage >= provinceTotalPages}
                    title="Trang sau"
                  >
                    <i className="bi bi-chevron-down"></i>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            
            {/* Province search */}
            <div className="mb-2">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm tỉnh/thành phố..."
                value={provinceSearch}
                onChange={handleProvinceSearchChange}
                disabled={disabled}
                size="sm"
              />
            </div>

            {/* Province select */}
            <div className="position-relative">
              <Form.Select
                value={selectedProvinceId}
                onChange={handleProvinceSelect}
                disabled={disabled || loadingProvinces}
                className="form-control"
                size="lg"
                style={{ paddingRight: '40px' }}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </Form.Select>
              
              {loadingProvinces && (
                <div className="position-absolute" style={{ top: '50%', right: '15px', transform: 'translateY(-50%)' }}>
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
            </div>
            
            {/* Province info */}
            {provinceTotalItems > 0 && (
              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-file-text me-1"></i>
                  Trang {provincePage}/{provinceTotalPages}
                </small>
              </div>
            )}
            
            {selectedProvinceId && getSelectedProvinceLabel() && (
              <div className="mt-2">
                <small className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Đã chọn tỉnh: <strong>{getSelectedProvinceLabel()}</strong>
                </small>
              </div>
            )}
          </div>
        </Col>

        {/* Commune Selection */}
        <Col md={6}>
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0">
                Phường/Xã <span className="text-danger">*</span>
              </Form.Label>
              <div className="d-flex align-items-center">
                <small className="text-muted me-2">
                  {getCommunePaginationInfo()}
                </small>
                <ButtonGroup size="sm">
                  <Button
                    variant="outline-secondary"
                    onClick={handlePrevCommunePage}
                    disabled={disabled || loadingCommunes || !selectedProvinceId || communePage <= 1}
                    title="Trang trước"
                  >
                    <i className="bi bi-chevron-up"></i>
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={handleNextCommunePage}
                    disabled={disabled || loadingCommunes || !selectedProvinceId || communePage >= communeTotalPages}
                    title="Trang sau"
                  >
                    <i className="bi bi-chevron-down"></i>
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            
            {/* Commune search */}
            <div className="mb-2">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm phường/xã..."
                value={communeSearch}
                onChange={handleCommuneSearchChange}
                disabled={disabled || !selectedProvinceId}
                size="sm"
              />
            </div>

            {/* Commune select */}
            <div className="position-relative">
              <Form.Select
                value={selectedCommuneId}
                onChange={handleCommuneSelect}
                disabled={disabled || loadingCommunes || !selectedProvinceId}
                className="form-control"
                size="lg"
                style={{ paddingRight: '40px' }}
              >
                <option value="">
                  {!selectedProvinceId ? "Chọn tỉnh trước" : "Chọn phường/xã"}
                </option>
                {communes.map((commune) => (
                  <option key={commune.id} value={commune.id}>
                    {commune.name}
                  </option>
                ))}
              </Form.Select>
              
              {loadingCommunes && (
                <div className="position-absolute" style={{ top: '50%', right: '15px', transform: 'translateY(-50%)' }}>
                  <Spinner animation="border" size="sm" variant="primary" />
                </div>
              )}
            </div>
            
            {/* Commune info */}
            {communeTotalItems > 0 && selectedProvinceId && (
              <div className="mt-2">
                <small className="text-muted">
                  <i className="bi bi-file-text me-1"></i>
                  Trang {communePage}/{communeTotalPages}
                </small>
              </div>
            )}
            
            {selectedCommuneId && getSelectedCommuneLabel() && (
              <div className="mt-2">
                <small className="text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Đã chọn phường/xã: <strong>{getSelectedCommuneLabel()}</strong>
                </small>
              </div>
            )}
            
            {!loadingCommunes && communes.length === 0 && selectedProvinceId && (
              <div className="mt-2">
                <small className="text-warning">
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  Không tìm thấy phường/xã nào cho tỉnh này
                </small>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {!selectedProvinceId && !loadingInitialData && (
        <div className="alert alert-info mt-3">
          <i className="bi bi-info-circle me-2"></i>
          Vui lòng chọn <strong>Tỉnh/Thành phố</strong> trước để hiển thị danh sách <strong>Phường/Xã</strong>
        </div>
      )}
    </div>
  );
};

export default AddressSelect;