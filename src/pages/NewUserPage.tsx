import React from 'react';
import MainContainer from '../components/MainContainer';
import { NewUserForm } from '../components/NewUserForm';

const NewUserPage: React.FC = () => {
  return (
    <MainContainer title="Nuevo Usuario">
      <NewUserForm/>
    </MainContainer>
  );
};

export default NewUserPage;