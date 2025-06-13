import React from 'react';
import MainContainer from '../components/MainContainer';
import { ConfirmNewUserForm } from '../components/ConfirmNewUserForm';

export const ConfirmNewUserPage: React.FC = () => {
  return (
    <MainContainer title="Confirmar Nuevo Usuario">
      <ConfirmNewUserForm/>
    </MainContainer>
  );
};

