// import { createNavigationContainerRef } from '@react-navigation/native';
// import { useRootStore } from '../../store/StoreProvider';

// type PushNavigationParams = {
//     type:
//     | 'chat'
//     | 'newEvent'
//     | 'invitation'
//     | 'follow'
//     | 'newParticipate'
//     | 'confirmParticipate'
//     | 'rejectParticipate'
//     | 'requestParticipate'
//     | 'newLike'
//     | 'pollInvite'
//     | 'pollAnswer',
//     chatId?: string,
//     eventId?: string,
//     userId?: string,
//     pollId?: string,
//     invitationId?: string,
// }

// export const pushNavigatorRef = createNavigationContainerRef<RootStackParamList>();


// // Ждём готовность навигатора (убирает setTimeout-лестницу)
// async function waitNavReady() {
//     let tries = 0;
//     while (!pushNavigatorRef.isReady() && tries < 40) { // ~2s
//         await new Promise(r => setTimeout(r, 50));
//         tries++;
//     }
// }

// export async function handlePushNavigationAsync(data: PushNavigationParams) {
//     const { onlineStore } = useRootStore();
//     if (!data) return;

//     // 1) Сначала готовим сокет/комнаты, если нужно
//     if (data.type === 'chat' && data.chatId) {
//         await onlineStore.ensureConnectedAndJoined([data.chatId]);
//     }

//     // 2) Ждём готовность навигатора, затем роутим
//     await waitNavReady();

//     switch (data.type) {
//         case 'chat':
//             if (data.chatId) pushNavigatorRef.navigate('chatMessages', { chatId: data.chatId });
//             break;
//         case 'newEvent':
//         case 'follow':
//             if (data.userId) pushNavigatorRef.navigate('userProfile', { id: data.userId });
//             break;
//         case 'invitation':
//             if (data.invitationId) pushNavigatorRef.navigate('eventInvitation', { invitationId: data.invitationId });
//             else pushNavigatorRef.navigate('profileActivity');
//             break;
//         case 'newParticipate':
//         case 'confirmParticipate':
//         case 'rejectParticipate':
//         case 'requestParticipate':
//         case 'newLike':
//             pushNavigatorRef.navigate('profileActivity');
//             break;
//         case 'pollInvite':
//         case 'pollAnswer':
//             if (data.pollId) pushNavigatorRef.navigate('poll', { id: data.pollId });
//             break;
//         default:
//             console.warn('📭 Unknown push type or missing data:', data);
//     }
// }


// export function handlePushNavigation(data: PushNavigationParams) {
//   // Deprecated — не используем, оставлено для совместимости
//   void handlePushNavigationAsync(data);
// }