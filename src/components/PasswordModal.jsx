import React, { useState } from 'react';

const PasswordModal = ({ loading, error, onSubmit }) => {
  const [pwd, setPwd] = useState('');

  const submit = async e => {
    e.preventDefault();
    onSubmit && onSubmit(pwd);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
      <form
        onSubmit={submit}
        className="bg-white rounded-card p-6 w-11/12 max-w-sm flex flex-col gap-4"
      >
        <h2 className="font-bold text-lg text-center">Contraseña de administrador</h2>
        <input
          type="password"
          placeholder="Ingresa la contraseña"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          className="border rounded-card p-2"
          required
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white py-2 rounded-card shadow hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default PasswordModal;
