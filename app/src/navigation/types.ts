export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;

  // App screens (authenticated)
  Dashboard: undefined;
  DuesOwed: undefined;
  DuesOwedDetail: { userId: string };
  DuesReceivable: undefined;
  DuesReceivableDetail: { userId: string };
  CreateDue: undefined;
  ConfirmDues: undefined;
  PendingDues: undefined;
  Friends: undefined;
  Settings: undefined;
};
