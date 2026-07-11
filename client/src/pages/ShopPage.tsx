import React from 'react';

const ShopPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#7C3AED' }}>Shop</h1>
        <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Browse our products</p>
        
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {/* Product cards will go here */}
          <div style={{ backgroundColor: '#111118', padding: '1rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
            <div style={{ height: '150px', backgroundColor: '#1E293B', borderRadius: '4px', marginBottom: '1rem' }}></div>
            <h3 style={{ color: '#F1F5F9', fontSize: '1.1rem' }}>Sample Product</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>$99.99</p>
            <button style={{ marginTop: '0.5rem', backgroundColor: '#7C3AED', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              Add to Cart
            </button>
          </div>
          <div style={{ backgroundColor: '#111118', padding: '1rem', borderRadius: '8px', border: '1px solid #1E293B' }}>
            <div style={{ height: '150px', backgroundColor: '#1E293B', borderRadius: '4px', marginBottom: '1rem' }}></div>
            <h3 style={{ color: '#F1F5F9', fontSize: '1.1rem' }}>Another Product</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>$149.99</p>
            <button style={{ marginTop: '0.5rem', backgroundColor: '#7C3AED', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
