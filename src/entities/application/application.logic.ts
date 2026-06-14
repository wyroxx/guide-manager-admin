interface AcceptanceState {
  applicationStatus: unknown;
  applicationEmail: unknown;
  assignedGuides: unknown;
  banList: unknown;
  guideEmail: unknown;
  guideLevel: unknown;
  requiredGuides: unknown;
  requiredLevels: unknown;
}

export function validateApplicationAcceptance(state: AcceptanceState) {
  if (state.applicationStatus !== 'pending') {
    throw new Error('По этой заявке уже принято решение.');
  }

  const guideEmail = typeof state.guideEmail === 'string'
    ? state.guideEmail.trim().toLowerCase()
    : '';
  const applicationEmail = typeof state.applicationEmail === 'string'
    ? state.applicationEmail.trim().toLowerCase()
    : '';
  if (!guideEmail || guideEmail !== applicationEmail) {
    throw new Error('Email заявки не совпадает с email гида.');
  }

  const banList = Array.isArray(state.banList)
    ? state.banList.map((email) => String(email).toLowerCase())
    : [];
  if (banList.includes(guideEmail)) {
    throw new Error('Гид находится в blacklist этой компании.');
  }

  const assignedGuides = Array.isArray(state.assignedGuides)
    ? state.assignedGuides.filter((email): email is string => typeof email === 'string')
    : [];
  if (assignedGuides.some((email) => email.toLowerCase() === guideEmail)) {
    throw new Error('Гид уже назначен на эту экскурсию.');
  }

  const requiredGuides = typeof state.requiredGuides === 'number'
    ? state.requiredGuides
    : 0;
  if (requiredGuides <= 0 || assignedGuides.length >= requiredGuides) {
    throw new Error('На экскурсии больше нет свободных мест для гидов.');
  }

  const requiredLevels = Array.isArray(state.requiredLevels) ? state.requiredLevels : [];
  if (!requiredLevels.includes(state.guideLevel)) {
    throw new Error('Уровень гида больше не соответствует требованиям экскурсии.');
  }

  const nextAssignedGuides = [...assignedGuides, guideEmail];
  return {
    guideEmail,
    nextAssignedGuides,
    hasSpots: nextAssignedGuides.length < requiredGuides,
  };
}
