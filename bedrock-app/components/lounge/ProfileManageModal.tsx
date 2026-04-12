import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, ScrollView } from 'react-native';
import { Txt } from '@toss/tds-react-native';
import { fetchAlbumPhotos, openCamera, FetchAlbumPhotosPermissionError, OpenCameraPermissionError } from '@apps-in-toss/framework';
import { getMyProfile, setMyProfile, MyProfile } from '../../lib/storage';
import { Haptic } from '../../lib/haptic';

interface ProfileManageModalProps {
  visible: boolean;
  onClose: () => void;
}

const GOLD = '#DAA520';

export const ProfileManageModal: React.FC<ProfileManageModalProps> = ({ visible, onClose }) => {
  const [profile, setProfile] = useState<MyProfile>({ nickname: '', gender: 'F', intro: '', profileImage: '' });
  const [showGallery, setShowGallery] = useState(false);
  // iOS: Modal이 열린 상태에서 시스템 피커(갤러리/카메라)를 호출하면 hanging 발생
  // → 피커 호출 전 Modal을 닫고, 완료 후 재오픈
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      getMyProfile().then(setProfile);
    }
  }, [visible]);

  const handlePickAlbum = async () => {
    setShowGallery(false);
    setIsPickerOpen(true);
    // Modal 닫힘 애니메이션(300ms) 완료 대기 후 피커 호출
    await new Promise(resolve => setTimeout(resolve, 350));
    try {
      const photos = await fetchAlbumPhotos({
        maxCount: 1,
        maxWidth: 720,
        base64: true,
      });
      if (photos && photos.length > 0) {
        const picked = photos[0];
        if (!picked) return;
        const imageSource = `data:image/jpeg;base64,${picked.dataUri}`;
        setProfile(prev => ({ ...prev, profileImage: imageSource }));
        Haptic.success();
      }
    } catch (e: any) {
      if (e instanceof FetchAlbumPhotosPermissionError) {
        await fetchAlbumPhotos.openPermissionDialog();
      } else {
        console.warn('[ProfileModal] Album access failed:', e);
      }
    } finally {
      setIsPickerOpen(false);
    }
  };

  const handleCamera = async () => {
    setShowGallery(false);
    setIsPickerOpen(true);
    await new Promise(resolve => setTimeout(resolve, 350));
    try {
      const photo = await openCamera({
        maxWidth: 720,
        base64: true,
      });
      if (photo) {
        setProfile(prev => ({ ...prev, profileImage: `data:image/jpeg;base64,${photo.dataUri}` }));
        Haptic.success();
      }
    } catch (e: any) {
      if (e instanceof OpenCameraPermissionError) {
        await openCamera.openPermissionDialog();
      } else {
        console.warn('[ProfileModal] Camera access failed:', e);
      }
    } finally {
      setIsPickerOpen(false);
    }
  };

  const handleSave = async () => {
    await setMyProfile(profile);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible && !isPickerOpen} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={s.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <Txt style={s.title}>내 프로필 관리</Txt>
            <TouchableOpacity onPress={onClose}>
              <Txt style={s.cancelText}>취소</Txt>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={s.photoRow}>
              <TouchableOpacity style={s.photoBtn} onPress={() => setShowGallery(!showGallery)}>
                {profile.profileImage ? (
                  <Image source={{ uri: profile.profileImage }} style={s.photoPreview} />
                ) : (
                  <Txt style={{ fontSize: 32 }}>📷</Txt>
                )}
                <View style={s.photoPlus}><Txt style={{ color: '#fff', fontSize: 12 }}>+</Txt></View>
              </TouchableOpacity>
              <View style={s.photoTexts}>
                <Txt style={s.photoTitle}>프로필 사진</Txt>
                <Txt style={s.photoSub}>라운지 첫 화면에선 비공개 처리됩니다.</Txt>
              </View>
            </View>

            {showGallery && (
              <View style={s.mediaActions}>
                <TouchableOpacity 
                  style={s.mediaBtn} 
                  onPress={handlePickAlbum}
                  activeOpacity={0.6}
                >
                  <Txt style={s.mediaIcon}>🖼️</Txt>
                  <Txt style={s.mediaLabel}>앨범에서 선택</Txt>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={s.mediaBtn} 
                  onPress={handleCamera}
                  activeOpacity={0.6}
                >
                  <Txt style={s.mediaIcon}>📸</Txt>
                  <Txt style={s.mediaLabel}>카메라 촬영</Txt>
                </TouchableOpacity>
              </View>
            )}

            <Txt style={s.label}>성별 선택</Txt>
            <View style={s.genderRow}>
              <TouchableOpacity
                style={[s.genderBtn, profile.gender === 'F' && s.genderBtnActiveF]}
                onPress={() => setProfile({ ...profile, gender: 'F' })}
              >
                <Txt style={[s.genderText, profile.gender === 'F' && s.genderTextActive]}>여성</Txt>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.genderBtn, profile.gender === 'M' && s.genderBtnActiveM]}
                onPress={() => setProfile({ ...profile, gender: 'M' })}
              >
                <Txt style={[s.genderText, profile.gender === 'M' && s.genderTextActive]}>남성</Txt>
              </TouchableOpacity>
            </View>

            <Txt style={s.label}>라운지 닉네임</Txt>
            <TextInput
              style={s.input}
              placeholder="자신을 표현할 닉네임을 입력하세요"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={profile.nickname}
              onChangeText={(text) => setProfile({ ...profile, nickname: text })}
              maxLength={15}
            />

            <Txt style={s.label}>한 줄 소개</Txt>
            <TextInput
              style={[s.input, s.introInput]}
              placeholder="이웃에게 보여질 짧은 소개말을 적어주세요"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={profile.intro}
              onChangeText={(text) => setProfile({ ...profile, intro: text })}
              multiline
              maxLength={50}
            />

            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
              <Txt style={s.saveBtnText}>저장하기</Txt>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: '#16161a', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  title: { fontSize: 18, fontWeight: '800', color: '#fff' },
  cancelText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
  body: { padding: 24, gap: 16 },
  label: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  genderBtnActiveF: { borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.15)' },
  genderBtnActiveM: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.15)' },
  genderText: { fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  genderTextActive: { color: '#fff', fontWeight: '800' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  introInput: { height: 100, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: GOLD, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
  photoBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 36 },
  photoPlus: { position: 'absolute', right: -4, bottom: -4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#6b4ce6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#16161a' },
  photoTexts: { flex: 1, gap: 4 },
  photoTitle: { fontSize: 16, color: '#fff', fontWeight: '700' },
  photoSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  mediaActions: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  mediaBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 4 },
  mediaIcon: { fontSize: 20 },
  mediaLabel: { fontSize: 12, color: '#fff', fontWeight: '600' },
});
