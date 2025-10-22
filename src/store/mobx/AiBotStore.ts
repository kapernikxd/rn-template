import { makeAutoObservable, runInAction } from 'mobx';
import { isAxiosError } from 'axios';
import { BaseStore, StoreListener } from './BaseStore';
import type { RootStore } from '../rootStore';
import aiBotDetailsService from '../../services/aibot/AiBotService';
import { MAX_GALLERY_ITEMS, steps } from '../../helpers/data/agent-create';
import { revokeGallery, revokeIfNeeded } from '../../helpers/utils/agent-create';

import { AiBotUpdatePayload, CreateAiAgentFormState, GalleryItem } from '../../types/aiBot';
import { AiBotDetails, AiBotDTO, AiBotMainPageBot, UserDTO } from '../../types';
import { AvatarFile, ProfilesFilterParams } from '../../types/profile';


export class AiBotStore {
  private readonly baseStore = new BaseStore();
  readonly subscribe: (listener: StoreListener) => () => void;
  private root: RootStore;

  step = 0;
  form: CreateAiAgentFormState = {
    firstName: '',
    lastName: '',
    profession: '',
    prompt: '',
    description: '',
    intro: '',
    categories: [],
    usefulness: [],
  };
  avatar: File | null = null;
  avatarPreview: string | null = null;
  gallery: GalleryItem[] = [];
  completed = false;
  readonly maxGalleryItems = MAX_GALLERY_ITEMS;

  private aiBotDetailsService = aiBotDetailsService;

  createdBot: UserDTO | null = null;
  isSubmitting = false;
  creationError: string | null = null;

  selectAiBot: AiBotDTO | null = null;
  userAiBots: AiBotDTO[] = [];
  botPhotos: string[] = [];
  botDetails: AiBotDetails | null = null;

  myBots: UserDTO[] = [];
  subscribedBots: UserDTO[] = [];
  photosLoading = false;
  photosUpdating = false;
  isAiUserLoading = false;

  mainPageBots: AiBotMainPageBot[] = [];
  isLoadingMainPageBots = false;
  mainPageBotsError: string | null = null;

  bots: UserDTO[] = [];
  isLoadingAiProfiles = false;
  hasMoreAiProfiles = false;

  constructor(root: RootStore) {
    this.root = root;
    this.subscribe = this.baseStore.subscribe;
    makeAutoObservable(this, {
      baseStore: false,
      subscribe: false,
      notify: false,
      root: false,
    } as any);
  }

  private notify() {
    this.baseStore.notify();
  }

  get steps() {
    return steps;
  }

  get currentStepComplete(): boolean {
    switch (this.step) {
      case 0:
        return Boolean(
          this.form.firstName.trim() &&
          this.form.lastName.trim() &&
          this.form.profession.trim() &&
          (this.avatar !== null || this.avatarPreview !== null),
        );
      case 1:
        return true;
      case 2:
        return Boolean(this.form.prompt.trim());
      default:
        return true;
    }
  }

  setStep(step: number) {
    if (step === this.step) return;
    this.step = step;
    this.completed = false;
    this.creationError = null;
    this.notify();
  }

  setFormField<K extends keyof CreateAiAgentFormState>(field: K, value: CreateAiAgentFormState[K]) {
    this.form = { ...this.form, [field]: value };
    this.notify();
  }

  private replaceAvatarPreview(preview: string | null) {
    if (this.avatarPreview && this.avatarPreview !== preview) {
      revokeIfNeeded(this.avatarPreview);
    }
    this.avatarPreview = preview;
  }

  setAvatar(file: File | null) {
    if (!file) {
      this.avatar = null;
      this.replaceAvatarPreview(null);
      this.notify();
      return;
    }
    const preview = URL.createObjectURL(file);
    this.avatar = file;
    this.replaceAvatarPreview(preview);
    this.notify();
  }

  addGalleryItems(files: File[]) {
    if (!files.length) return;
    const remaining = Math.max(0, this.maxGalleryItems - this.gallery.length);
    if (remaining === 0) return;
    const allowed = files.slice(0, remaining);
    const mapped = allowed.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      preview: URL.createObjectURL(file),
      file,
    }));
    this.gallery = [...this.gallery, ...mapped];
    this.notify();
  }

  removeGalleryItem(id: string) {
    const target = this.gallery.find((item) => item.id === id);
    if (target) {
      revokeIfNeeded(target.preview);
    }
    this.gallery = this.gallery.filter((item) => item.id !== id);
    this.notify();
  }

  goNext() {
    if (!this.currentStepComplete) return;
    if (this.step < this.steps.length - 1) {
      this.setStep(this.step + 1);
    } else {
      this.completed = true;
      this.notify();
    }
  }

  goPrev() {
    if (this.step === 0) return;
    this.setStep(this.step - 1);
  }

  resetFlow() {
    revokeGallery(this.gallery);
    this.form = {
      firstName: '',
      lastName: '',
      profession: '',
      prompt: '',
      description: '',
      intro: '',
      categories: [],
      usefulness: [],
    };
    this.avatar = null;
    this.replaceAvatarPreview(null);
    this.gallery = [];
    this.step = 0;
    this.completed = false;
    this.creationError = null;
    this.createdBot = null;
    this.isSubmitting = false;
    this.notify();
  }

  dispose() {
    this.replaceAvatarPreview(null);
    revokeGallery(this.gallery);
    this.gallery = [];
  }

  async fetchAllAiBots(params: ProfilesFilterParams = {}) {
    const page = params.page ?? 1;
    const limit = params.limit;

    if (this.isLoadingAiProfiles || (!this.hasMoreAiProfiles && page > 1)) return;

    this.isLoadingAiProfiles = true;
    try {
      const { data } = await this.aiBotDetailsService.getAllAiBots({ page, limit });
      runInAction(() => {
        // Если это первая страница — заменяем события
        if (page === 1) {
          this.bots = data.profiles;
          // Если загружаем следующую страницу — добавляем к существующим
        } else {
          this.bots = [...this.bots, ...data.profiles];
        }
        this.hasMoreAiProfiles = data.hasMore; // Флаг, есть ли еще данные
      });
    } catch (error) {
      console.error("Error fetching ai profiles", error);
    } finally {
      runInAction(() => {
        this.isLoadingAiProfiles = false;
      });
    }
  }

  async fetchMainPageBots() {
    if (this.isLoadingMainPageBots) {
      return;
    }

    this.isLoadingMainPageBots = true;
    this.mainPageBotsError = null;
    this.notify();

    try {
      const { data } = await this.aiBotDetailsService.fetchAiBotsForMainPage();
      runInAction(() => {
        this.mainPageBots = data ?? [];
      });
      this.notify();
      return this.mainPageBots;
    } catch (error) {
      console.error("Failed to load AI bots for admin main page", error);
      runInAction(() => {
        this.mainPageBots = [];
        this.mainPageBotsError = "Не удалось загрузить список ботов. Попробуйте обновить страницу позже.";
      });
      this.notify();
    } finally {
      runInAction(() => {
        this.isLoadingMainPageBots = false;
      });
      this.notify();
    }
  }

  async fetchAiBotById(id: string) {
    this.isAiUserLoading = true;
    this.notify();
    try {
      const { data } = await this.aiBotDetailsService.getAiBotById(id);
      runInAction(() => {
        this.selectAiBot = data;
      });
      this.notify();
      return data;
    } catch (error) {
      runInAction(() => {
        this.selectAiBot = null;
      });
      this.notify();
      this.root.uiStore.showSnackbar("Failed", "error");
      console.error("Failed to load AI bot", error);
    } finally {
      runInAction(() => {
        this.isAiUserLoading = false;
      });
      this.notify();
    }
  }

  async fetchAiBotsByUserId(userId: string) {
    this.isAiUserLoading = true;
    this.notify();
    try {
      const { data } = await this.aiBotDetailsService.getAiBotsByCreator(userId);
      runInAction(() => {
        this.userAiBots = data;
      });
      this.notify();
      return data;
    } catch (error) {
      runInAction(() => {
        this.userAiBots = [];
      });
      this.notify();
      console.error("Failed to load user AI bots", error);
    } finally {
      runInAction(() => {
        this.isAiUserLoading = false;
      });
      this.notify();
    }
  }

  clearSelectedAiBot() {
    this.selectAiBot = null;
    this.notify();
  }

  clearUserAiBots() {
    this.userAiBots = [];
    this.notify();
  }

  async fetchMyAiBots() {
    try {
      const { data } = await this.aiBotDetailsService.getMyAiBots();
      runInAction(() => {
        this.myBots = data;
        this.notify();
      });
    } catch (error) {
      this.root.uiStore.showSnackbar("Failed", "error");
      console.error("Failed to load my AI bots", error);
    }
  }

  async fetchSubscribedAiBots() {
    try {
      const { data } = await this.aiBotDetailsService.getSubscribedAiBots();
      runInAction(() => {
        this.subscribedBots = data;
        this.notify();
      });
    } catch (error) {
      this.root.uiStore.showSnackbar("Failed", "error");
      console.error("Failed to load subscribed AI bots", error);
    }
  }

  async followAiBot(id: string) {
    try {
      const { data } = await this.aiBotDetailsService.followAiBotById(id);
      runInAction(() => {
        const updateFollowers = <T extends UserDTO>(collection: T[]) =>
          collection.map((bot) => (bot._id === id ? ({ ...bot, followers: data.followers } as T) : bot));

        this.myBots = updateFollowers(this.myBots);
        this.userAiBots = updateFollowers(this.userAiBots);
        this.bots = updateFollowers(this.bots);

        if (this.selectAiBot && this.selectAiBot._id === id) {
          this.selectAiBot = { ...this.selectAiBot, followers: data.followers, isFollowing: data.isFollowing };
        }

        if (this.botDetails) {
          this.botDetails = { ...this.botDetails, isFollowing: data.isFollowing };
        }

        if (data.isFollowing) {
          const existsInSubscribed = this.subscribedBots.some((bot) => bot._id === id);
          const botToAdd =
            this.selectAiBot && this.selectAiBot._id === id
              ? this.selectAiBot
              : this.userAiBots.find((bot) => bot._id === id) ?? this.bots.find((bot) => bot._id === id);

          if (!existsInSubscribed && botToAdd) {
            this.subscribedBots = [...this.subscribedBots, botToAdd];
          } else if (existsInSubscribed) {
            this.subscribedBots = updateFollowers(this.subscribedBots);
          }
        } else {
          this.subscribedBots = this.subscribedBots.filter((bot) => bot._id !== id);
        }
      });
      this.notify();
    } catch (error) {
      this.root.uiStore.showSnackbar('Failed to update follow status', 'error');
      console.error('Failed to update follow status', error);
    }
  }

  async createBot(formData: FormData) {
    try {
      const { data } = await this.aiBotDetailsService.createAiBot(formData);
      runInAction(() => {
        this.myBots.push(data);
        this.notify();
      });
      this.root.uiStore.showSnackbar("Created", "success");
      return data;
    } catch (error: unknown) {
      this.root.uiStore.showSnackbar("Failed", "error");
      throw error;
    }
  }

  private buildCreationFormData() {
    const formData = new FormData();
    formData.append('name', this.form.firstName.trim());
    formData.append('lastname', this.form.lastName.trim());
    formData.append('profession', this.form.profession.trim());
    const userBio = this.form.description.trim();
    if (userBio) {
      formData.append('userBio', userBio);
    }
    formData.append('aiPrompt', this.form.prompt.trim());
    const intro = this.form.intro.trim();
    if (intro) {
      formData.append('intro', intro);
      formData.append('introMessage', intro);
    }
    if (this.form.categories.length) {
      formData.append('categories', JSON.stringify(this.form.categories));
    }
    if (this.form.usefulness.length) {
      formData.append('usefulness', JSON.stringify(this.form.usefulness));
    }
    if (this.avatar) {
      formData.append('avatar', this.avatar);
    }
    return formData;
  }

  private buildGalleryFormData() {
    if (!this.gallery.length) {
      return null;
    }

    const formData = new FormData();
    this.gallery.forEach((item) => {
      formData.append('photos', item.file, item.file.name);
    });
    return formData;
  }

  async submitCreation() {
    if (this.isSubmitting || this.completed) {
      return;
    }

    this.isSubmitting = true;
    this.creationError = null;
    this.notify();

    try {
      const payload = this.buildCreationFormData();
      const created = await this.createBot(payload);

      if (!created) {
        throw new Error('Failed to create AI agent');
      }

      const galleryPayload = this.buildGalleryFormData();
      if (galleryPayload) {
        await this.addBotPhotos(created._id, galleryPayload);
      }

      runInAction(() => {
        this.completed = true;
        this.createdBot = created;
      });
      this.notify();

      this.root.uiStore.showSnackbar('AI agent created', 'success');
    } catch (error: unknown) {
      const message = this.resolveErrorMessage(error);

      runInAction(() => {
        this.creationError = message;
      });
      this.notify();

      this.root.uiStore.showSnackbar('Failed to create AI agent', 'error');
    } finally {
      runInAction(() => {
        this.isSubmitting = false;
      });
      this.notify();
    }
  }

  private resolveErrorMessage(error: unknown) {
    if (typeof error === 'string') {
      return error;
    }

    if (isAxiosError<{ message?: string | string[] }>(error)) {
      const { message } = error.response?.data ?? {};
      if (typeof message === 'string') {
        return message;
      }
      if (Array.isArray(message) && message.length) {
        return String(message[0]);
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'Failed to create AI agent';
  }

  async updateBot(id: string, payload: AiBotUpdatePayload, avatar?: AvatarFile | File) {
    try {
      let updated: UserDTO | undefined;

      if (Object.keys(payload).length) {
        const res = await this.aiBotDetailsService.updateAiBot(id, payload);
        updated = res.data;
      }

      if (avatar) {
        const formData = new FormData();
        if (avatar instanceof File) {
          formData.append("avatar", avatar);
        } else {
          const file = {
            uri: avatar.uri,
            name: avatar.name,
            type: avatar.type,
          } as unknown as Blob;
          formData.append("avatar", file);
        }
        const res = await this.aiBotDetailsService.uploadAiBotAvatar(id, formData);
        updated = res.data;
      }

      if (updated) {
        const additionalFields: Partial<AiBotDTO> = {};
        if (payload.aiPrompt !== undefined) {
          additionalFields.aiPrompt = payload.aiPrompt;
        }
        if (payload.intro !== undefined) {
          additionalFields.intro = payload.intro;
        }
        if (payload.categories !== undefined) {
          additionalFields.categories = payload.categories;
        }
        if (payload.usefulness !== undefined) {
          additionalFields.usefulness = payload.usefulness;
        }

        runInAction(() => {
          const applyUserUpdate = <T extends UserDTO>(collection: T[]) =>
            collection.map((bot) => (bot._id === id ? ({ ...bot, ...updated } as T) : bot));
          const applyAiBotUpdate = (collection: AiBotDTO[]) =>
            collection.map((bot) => (bot._id === id ? ({ ...bot, ...updated, ...additionalFields }) : bot));

          this.myBots = applyUserUpdate(this.myBots);
          this.userAiBots = applyAiBotUpdate(this.userAiBots);
          this.bots = applyUserUpdate(this.bots);

          if (this.selectAiBot && this.selectAiBot._id === id) {
            this.selectAiBot = { ...this.selectAiBot, ...updated, ...additionalFields };
          }

          if (this.createdBot && this.createdBot._id === id) {
            this.createdBot = { ...this.createdBot, ...updated };
          }

          if (this.botDetails && this.selectAiBot && this.selectAiBot._id === id) {
            this.botDetails = {
              ...this.botDetails,
              ...(payload.aiPrompt !== undefined ? { aiPrompt: payload.aiPrompt } : {}),
              ...(payload.intro !== undefined ? { intro: payload.intro } : {}),
              ...(payload.categories !== undefined ? { categories: payload.categories } : {}),
              ...(payload.usefulness !== undefined ? { usefulness: payload.usefulness } : {}),
            };
          }

          this.notify();
        });

        this.root.uiStore.showSnackbar('AI agent updated', 'success');
      }

      return updated as AiBotDTO | undefined;
    } catch (error) {
      this.root.uiStore.showSnackbar('Failed to update AI agent', 'error');
      console.error('Failed to update AI agent', error);
      throw error;
    }
  }

  async deleteBot(id: string) {
    try {
      await this.aiBotDetailsService.deleteAiBot(id);
      runInAction(() => {
        this.myBots = this.myBots.filter((bot) => bot._id !== id);
        this.userAiBots = this.userAiBots.filter((bot) => bot._id !== id);
        this.bots = this.bots.filter((bot) => bot._id !== id);
        if (this.selectAiBot?._id === id) {
          this.selectAiBot = null;
        }
        if (this.createdBot?._id === id) {
          this.createdBot = null;
        }
        this.botDetails = null;
        this.botPhotos = [];
        this.notify();
        this.root.uiStore.showSnackbar('AI agent deleted', 'success');
      });
    } catch (error) {
      throw error;
    }
  }

  getBot(id: string) {
    return this.myBots.find(b => b._id === id);
  }

  async fetchBotDetails(id: string) {
    this.photosLoading = true;
    this.notify();
    try {
      const { data } = await this.aiBotDetailsService.getAiBotDetails(id);
      runInAction(() => {
        this.botPhotos = data.photos ?? [];
        this.botDetails = data;
      });
      this.notify();
    } catch (error) {
      this.root.uiStore.showSnackbar("Failed", "error");
      console.error('Failed to fetch AI bot details', error);
    } finally {
      runInAction(() => {
        this.photosLoading = false;
      });
      this.notify();
    }
  }

  async toggleFollow(botId: string) {
    try {
      const { data } = await this.aiBotDetailsService.followAiBotById(botId);
      runInAction(() => {
        this.selectAiBot = {
          ...this.selectAiBot,
          followers: data?.followers ?? this.selectAiBot?.followers,
          isFollowing: data?.isFollowing,
        } as AiBotDTO;
      });
    } catch (e) {
      this.root.uiStore.showSnackbar("Failed", "error");
    }
  }

  async addBotPhotos(id: string, formData: FormData) {
    this.photosUpdating = true;
    this.notify();
    try {
      const { data } = await this.aiBotDetailsService.addAiBotPhotos(id, formData);
      runInAction(() => {
        this.botPhotos = data.photos ?? [];
      });
      this.notify();
      this.root.uiStore.showSnackbar("Saved", "success");
    } catch (error) {
      this.root.uiStore.showSnackbar("Upload failed", "error");
      console.error('Failed to upload AI bot photos', error);
    } finally {
      runInAction(() => {
        this.photosUpdating = false;
      });
      this.notify();
    }
  }

  async deleteBotPhotos(id: string, photoUrls: string[]) {
    if (!photoUrls.length) return;
    this.photosUpdating = true;
    this.notify();
    try {
      const { data } = await this.aiBotDetailsService.deleteAiBotPhotos(id, photoUrls);
      runInAction(() => {
        this.botPhotos = data.photos ?? [];
      });
      this.notify();
      this.root.uiStore.showSnackbar("Deleted", "success");
    } catch (error) {
      this.root.uiStore.showSnackbar("Delete failed", "error");
      console.error('Failed to delete AI bot photos', error);
    } finally {
      runInAction(() => {
        this.photosUpdating = false;
      });
      this.notify();
    }
  }

  clearBotDetails() {
    this.botPhotos = [];
    this.botDetails = null;
    this.notify();
  }
}
