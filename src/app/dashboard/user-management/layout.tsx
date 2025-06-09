import React from 'react';

interface Props {
  children: React.ReactNode; // Add children prop
}

const UserManagementLayout = ({ children }: Props) => {
  return <div>{children}</div>;
};

export default UserManagementLayout;
