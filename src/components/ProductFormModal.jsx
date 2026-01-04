import React, { useEffect, useState } from 'react';
import { useProducts } from '../context/ProductContext';

const empty = {
  name: '',
  description: '',
  price: '',
  image: '',
  image2: '',
  stock: '',
  category: '',
};

const ProductFormModal = ({ open, onClose, editing }) => {
  const { addProduct, updateProduct } = useProducts();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm(empty);
  }, [editing]);

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const data = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) };
    if (editing) await updateProduct(editing.id, data);
    else await addProduct(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-30">
      <div className="bg-white rounded-card p-4 w-11/12 max-w-md">
        <h2 className="font-bold text-lg mb-4">{editing ? 'Editar' : 'Agregar'} producto</h2>
        <form className="space-y-3" onSubmit={handleSubmit}>
          {['name', 'description', 'price', 'image', 'image2', 'stock', 'category'].map(field => (
            <input
              key={field}
              name={field}
              value={form[field] ?? ''}
              onChange={handleChange}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full border rounded-card p-2 text-sm"
              required
            />
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1 text-gray-600">Cancelar</button>
            <button type="submit" className="px-4 py-1 bg-primary text-white rounded-card">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
