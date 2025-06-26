import { IsCorporateUser, PageType, ResponseCode, SType, UserId } from './../../../shared/enums/app.enums';
import { Component, computed, input, inject, signal, isDevMode, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Applicant, PurchaseList, PurchaseListItem } from '../models/applicant.model';
import { ApplicantDataPipe } from '../pipe/applicant-data.pipe';
import { ModalService } from '../../../core/services/modal/modal.service';
import { DownloadCVRequest } from '../class/card-query-builder';
import { CustomCvDownloadResponse } from '../../../shared/models/response';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { MoveToActivityHeaderComponent } from '../../../shared/components/move-to-activity-header/move-to-activity-header.component';
import { JobNoLocalStorage } from '../../../shared/enums/app.enums';
import { ApplicantCard } from '../class/applicant-helper';
import { SingleVideoCVComponent } from '../single-video-cv/single-video-cv.component';
import { ApplicantCardService } from '../services/applicant-card.service';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, finalize } from 'rxjs/operators';
import { CompanyIdLocalStorage } from '../../../shared/enums/app.enums';
import { downloadCustomizedCV, formateDateTime } from '../../../shared/utils/functions';
import { IFrameLoaderComponent } from '../../../shared/components/iFrame-loader/iFrame-loader.component';
import { NavDataService } from '../../../core/services/nav-data.service';
import { ToastrService } from 'ngx-toastr';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ConfirmationModalService } from '../../../core/services/confirmationModal/confirmation-modal.service';

@Component({
  selector: 'app-applicant-card',
  standalone: true,
  imports: [CommonModule, ApplicantDataPipe, ReactiveFormsModule, InputComponent],
  templateUrl: './applicant-card.component.html',
  styleUrl: './applicant-card.component.scss'
})
export class ApplicantCardComponent {
  isDevMode = signal(isDevMode());
  applicant = input.required<Applicant>();
  readonly stars = [1, 2, 3, 4, 5];
  visible = signal(false);
  skilExperiences = signal<any[]>([]);
  expanded = signal(false);
  skillsExpanded = signal(false);
  isVisible = computed(() => this.visible());
  immediatelyAvailable = signal(1);
  CustomizedResume = signal(1);
  private modalService = inject(ModalService);
  public applicantCardService = inject(ApplicantCardService);
  private localStorageService = inject(LocalstorageService);
  private navDataService = inject(NavDataService);
  private toastr = inject(ToastrService);
  private confirmationModal = inject(ConfirmationModalService);
  CvBankSearchAccess = computed(() => this.salesPersonData()?.cvSearchAccess === true);
  photoBlurAmount: string = '5px';
  textBlurAmount: string = '3px';
  cvDetailsLink: string = '';
  pageType = PageType;
  sType = SType;
  formateDateTime = formateDateTime;
  rankPointStars = computed(() => {
    const rankPoint = this.applicant().rankPoint || 0;

    if (rankPoint >= 80) return 5;
    if (rankPoint >= 60) return 4;
    if (rankPoint >= 40) return 3;
    if (rankPoint >= 25) return 2;
    if (rankPoint >= 15) return 1;
    return 0;
  });

  isCorporateUser = computed(() => this.localStorageService.getItem(IsCorporateUser) === 'true');
  cvbankAccessLimitExpired = computed(() => this.navDataService.cvbankAccessLimitExpired());

  cvViewedCount = computed(() => this.salesPersonData()?.cvSearchService?.viewed || 0);
  cvLimitCount = computed(() => this.salesPersonData()?.cvSearchService?.limit || 0);

  photoBlurStyle = computed(() => {
    if (this.isCorporateUser()) {
      if (this.applicant().isBlueCollarCat === 1) {
        return {};
      }
      else if (this.CvBankSearchAccess()) {
        if (this.cvbankAccessLimitExpired()) {
          if (!this.applicant().resumeViewedAlready) {
            return { 'filter': `blur(${this.photoBlurAmount})` };
          } else {
            return {};
          }
        }
        else {
          return {};
        }
      } else {
        if (this.applicant().isPurchased) {
          return {};
        } else {
          return { 'filter': `blur(${this.photoBlurAmount})` };
        }
      }
    } else {
      if (this.applicant().isPurchased) {
        return {};
      } else {
        return { 'filter': `blur(${this.photoBlurAmount})` };
      }
    }
  });

  textBlurStyle = computed(() => {
    if (this.isCorporateUser()) {
      if (this.applicant().isBlueCollarCat === 1) {
        return {};
      } else if (this.CvBankSearchAccess()) {
        if (this.cvbankAccessLimitExpired()) {
          if (!this.applicant().resumeViewedAlready) {
            return { 'filter': `blur(${this.textBlurAmount})` };
          } else {
            return {};
          }
        }
        else {
          return {};
        }
      } else {
        if (this.applicant().isPurchased) {
          return {};
        }
        else {
          return { 'filter': `blur(${this.textBlurAmount})` };
        }
      }
    } else {
      if (this.applicant().isPurchased) {
        return {};
      }
      else {
        return { 'filter': `blur(${this.textBlurAmount})` };
      }
    }
  });
  rating = computed(() => parseFloat(this.applicant().starRating) || 0);

  ageValue = computed(() => this.applicant().age.endsWith('.0') ? this.applicant().age.slice(0, -2) : this.applicant().age);

  photoUrl = computed(() => this.applicant().photo);

  expectedSalaryValue = computed(() => this.applicant().expectedSalary);

  isShortlisted = computed(() => this.applicant().shortList === 1);

  name = computed(() => this.applicant().applicantName);

  education = computed(() => this.applicant().degree);



  location = computed(() => {
    const addresses = this.applicant()?.address;
    if (addresses && Array.isArray(addresses) && addresses.length > 0) {
      const fullAddress = addresses[0]?.fullAddress;
      if (fullAddress) {
        const addressParts = fullAddress.split(',');
        if (addressParts.length >= 2) {
          return `${addressParts[0].trim()}, ${addressParts[addressParts.length - 1].trim()}`;
        }
        return fullAddress;
      }
    }
    return null;
  });

  phone = computed(() => {
    if (!this.applicant()) {
      return null;
    }

    const mobiles = this.applicant().mobiles;

    if (!mobiles || !Array.isArray(mobiles) || mobiles.length === 0) {
      return null;
    }
    const validMobiles = mobiles.filter(m => m !== null);

    const validMobile = validMobiles.find(m => m && typeof m === 'object' && 'mobileNo' in m && !!m.mobileNo && m.mobileNo.trim() !== '');

    return validMobile?.mobileNo ?? null;
  });


  email = computed(() => {
    const emails = this.applicant()?.emails;
    if (emails && Array.isArray(emails) && emails.length > 0 && emails[0]?.emailAddress) {
      return emails[0].emailAddress;
    }
    return null;
  });

  cvsDisabled = computed(() => {
    if (this.isCorporateUser()) {
      if (!this.CvBankSearchAccess()) {
        if (!this.applicant().isPurchased && !this.applicant().isBlueCollarCat) {
          return true;
        } else {
          return false;
        }
      }
      else if (this.CvBankSearchAccess() && this.cvbankAccessLimitExpired()) {
        if (!this.applicant().resumeViewedAlready) {
          return true;
        } else {
          return false;
        }
      }
      else {
        return false;
      }
    } else {
      if (!this.applicant().isPurchased) {
        return true;
      } else {
        return false;
      }
    }
  });

  salesPersonData = computed(() => this.navDataService.navData());


  purchasePopoverVisible = signal(false);
  groupName = signal('');
  creatingGroup = signal(false);
  isCreatePurchaseList = signal(false);
  selectedListName = signal<string | null>(null);
  selectedList = signal<PurchaseListItem>({} as PurchaseListItem);
  PurchaseListId = signal('');
  PurchaseListName = signal('');
  isPurchasedBtnFade = signal(false);

  newPurchaseListName = new FormControl('', Validators.required);
  purchasedlistData: any[] = [];


  @Output() addedToPurchasedList = new EventEmitter<boolean>();
  @Output() purchaseListData = new EventEmitter<PurchaseList>();

  isContentAccessible(): boolean {
    return this.CvBankSearchAccess() === true;
  }

  onClickCustomizedCV() {
    if (this.cvsDisabled()) {
      this.confirmationModal.openModal({
        content: {
          title: 'Resume Details',
          content: "To view/access the candidate's resume, you have to purchase it first.",
          linkText: this.isCorporateUser() ? 'Learn more about CV Bank Access' : '',
          linkUrl: this.isCorporateUser() ? 'https://corporate3.bdjobs.com/services.asp?from=recruiter' : '',
          closeButtonText: 'Okay',
          saveButtonText: '',
          isIcon: false,
          isCloseButtonVisible: true,
          isSaveButtonVisible: false
        }
      })
      return;
    }
    const payload: DownloadCVRequest = {
      hFileName: this.applicant()?.applicantName as string,
      hID: this.applicant()?.EncrpID as string,
      userId: '',
      decodeid: '',
      deviceType: 'web'
    };
    this.applicantCardService
      .downloadCV(payload)
      .pipe(
    )
      .subscribe({
        next: (res) => {
          if (res.status === 0) {
            downloadCustomizedCV(this.applicant()?.applicantName as string, res);
            //this.downloadCV(res);
          }
        },
      });
  }

  openVideoCVDetails() {
    if (this.cvsDisabled()) {
      this.confirmationModal.openModal({
        content: {
          title: 'Video Resume Details',
          content: "To view/access the candidate's video resume, you have to purchase it first.",
          linkText: this.isCorporateUser() ? 'Learn more about CV Bank Access' : '',
          linkUrl: this.isCorporateUser() ? 'https://corporate3.bdjobs.com/services.asp?from=recruiter' : '',
          closeButtonText: 'Okay',
          saveButtonText: '',
          isIcon: false,
          isCloseButtonVisible: true,
          isSaveButtonVisible: false
        }
      })
      return;
    }
    this.cvDetailsLink = this.genCvDetailsLink();
    const applicant = this.applicant();
    const isPurchasedValue = applicant?.isPurchased || 0;
    const applicantId = applicant?.applicantId || 0;
    const serviceId: number = (this.salesPersonData()?.cvSearchService?.id ?? 0);
    this.modalService.setModalConfigs({
      attributes: {
        modalWidth: '1200px',
      },
      inputs: {
        modalTitle: 'Video CV',
        jobId: 0,
        previewUrl: this.cvDetailsLink,
        contentType: 'video-cv-details',
        applyId: applicantId,
        applicantName: applicant.applicantName || '',
        serviceId: serviceId,
        email: this.email(),
        mobile: this.phone(),
        isPurchased: isPurchasedValue,
        encrpID: this.applicant()?.EncrpID as string,
        photo: applicant.photo,
        cvType: applicant?.attachedCV === 1 ? applicant?.resumeType || '' : '',

      },
      componentRef: MoveToActivityHeaderComponent,
    });
  }

  private genCvDetailsLink() {

    return ApplicantCard.getCVDetailsLink(
      this.applicant(), this.isCorporateUser(), this.localStorageService
    );
  }

  openSingleVideoResume() {
    const applicant = this.applicant();
    const isPurchasedValue = applicant?.isPurchased || 0;
    const serviceId: number = (this.salesPersonData()?.cvSearchService?.id ?? 0);
    const applicantId = applicant?.applicantId || 0;

    this.modalService.setModalConfigs({
      attributes: {},
      inputs: {
        jobId: +this.localStorageService.getItem(JobNoLocalStorage) || 0,
        applyId: applicantId,
        modalTitle: 'Video CV',
        applicantName: this.applicant()?.applicantName || '',
        email: this.email() || '',//this.applicant()?.email || '',
        mobile: this.phone() || '',//this.firstMobileNumber || '',
        photo: this.applicant()?.photo || '',
        cvType:
          applicant?.attachedCV === 1
            ? applicant?.resumeType || ''
            : '',
        jobInfo: '',//this.jobInfoService.getJobInfo()?.data.jobTitle,
        serviceId: serviceId,
        isPurchased: isPurchasedValue,
        previewUrl: this.cvDetailsLink
          ? this.cvDetailsLink
          : this.genCvDetailsLink(),
        applicant: this.applicant(),

      },
      componentRef: SingleVideoCVComponent,
    });
  }


  loadCvDetailsInIFrame() {
    this.cvDetailsLink = this.genCvDetailsLink();
    const applicant = this.applicant();
    this.modalService.setModalConfigs({
      attributes: {
        modalWidth: '1200px',
        isHideScroll: true,
      },
      inputs: {
        modalTitle: 'CV Details',
        isOpenExternal: true,
        applicant: this.applicant(),
        cvType:
          applicant?.attachedCV === 1
            ? applicant?.resumeType || ''
            : '',
        previewUrl: this.cvDetailsLink,
        contentType: 'cv-details',
        jobId: +this.localStorageService.getItem(JobNoLocalStorage) || 0,
        applyId: this.applicant()?.applicantId || 0,
        applicantName: this.applicant()?.applicantName || '',
        email: this.email() || '',
        mobile: this.phone() || '',
        photo: this.applicant()?.photo || '',
        jobInfo: '',//this.jobInfoService.getJobInfo()?.data.jobTitle,
      },
      componentRef: MoveToActivityHeaderComponent,
    });
  }

  skillsLoading = signal(false);

  getSkillExperience() {
    this.visible.update(current => !current);

    if (this.visible()) {
      this.skillsLoading = signal(true);
      const applyId = this.applicant().applicantId;
      const companyID = this.localStorageService.getItem(CompanyIdLocalStorage);

      this.applicantCardService.getSkillExperience({
        applyId: applyId,
        companyID: companyID
      })
        .pipe(
          finalize(() => this.skillsLoading.set(false))
        )
        .subscribe({
          next: (response) => {
            if (response && response.DataSkillWorkArea) {
              this.skilExperiences.set(response.DataSkillWorkArea);
            } else {
              this.skilExperiences.set([]);
            }
          },
          error: (error) => {
            console.error('Error fetching skills:', error);
            this.skilExperiences.set([]);
          }
        });
    }
  }

  closePopoverSkills() {
    this.visible.set(false);
  }

  checkIfSkillHasWorkArea(): boolean {
    return this.skilExperiences().some(skill => skill.SkillType === "workarea");
  }

  checkIfSkillHasSkill(): boolean {
    return this.skilExperiences().some(skill => skill.SkillType === "skill");
  }


  isPurchasePopoverVisible = computed(() => this.purchasePopoverVisible());

  togglePurchasePopover() {
    this.purchasePopoverVisible.update(current => !current);
    if (this.purchasePopoverVisible()) {
      this.visible.set(false);
    }
  }

  closePurchasePopoverTop() {
    this.isCreatePurchaseList.set(false);
    this.purchasePopoverVisible.set(false);
    this.applicantCardService.purchaseListId.set('');
    this.applicantCardService.selectedListName.set('');

  }

  closePurchasePopover() {
    this.isCreatePurchaseList.set(false);
    this.purchasePopoverVisible.set(false);
  }

  handleBuyNowClick(): void {
    this.togglePurchasePopover();
  }

  handleBuyNowDirectClick(): void {
    const resumeId = this.applicant().applicantId;

    if (!resumeId) {
      this.toastr.error('Invalid resume ID', 'Error');
      return;
    }

    this.applicantCardService.addCvToListFromJobSeeker(resumeId)
      .subscribe({
        next: (response) => {
          if (response && response.listid) {
            const listId = response.listid.toString();

            this.submitPurchaseForm(resumeId, listId);

            this.applicantCardService.addApplicantToSelection(resumeId);
          } else {
          }
        },
        error: (error) => {
          console.error('Error adding CV to purchase list:', error);
          this.toastr.error('Failed to process CV purchase', 'Error');
        }
      });
  }

  private submitPurchaseForm(resumeId: string, listId: string): void {

    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://corporate3.bdjobs.com/CV_Purchase_Payment_Confirm.asp';
    form.id = 'frmCartBuy';
    const resumeIdInput = document.createElement('input');
    resumeIdInput.type = 'hidden';
    resumeIdInput.name = 'hidResumeIdfrmjobseeker';
    resumeIdInput.id = 'hidResumeIdfrmjobseeker';
    resumeIdInput.value = resumeId;
    form.appendChild(resumeIdInput);

    const listIdInput = document.createElement('input');
    listIdInput.type = 'hidden';
    listIdInput.name = 'hidListIdfrmjobseeker';
    listIdInput.id = 'hidListIdfrmjobseeker';
    listIdInput.value = listId;
    form.appendChild(listIdInput);

    const requestTypeInput = document.createElement('input');
    requestTypeInput.type = 'hidden';
    requestTypeInput.name = 'hidfrmRequest';
    requestTypeInput.id = 'hidfrmRequest';
    requestTypeInput.value = 'jobseeker';
    form.appendChild(requestTypeInput);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    this.applicantCardService.addApplicantToSelection(resumeId);

  }

  toggleExpanded() {
    this.expanded.update(value => !value);
  }

  toggleSkillsExpanded() {
    this.skillsExpanded.update(value => !value);
  }

  hasOverflow(): boolean {
    const workAreaCount = this.skilExperiences()
      .filter(skill => skill.SkillType === "workarea").length;
    return workAreaCount > 2;
  }

  hasSkillsOverflow(): boolean {
    const skillCount = this.skilExperiences()
      .filter(skill => skill.SkillType === "skill").length;
    return skillCount > 3;
  }




  isCreatingGroup(): boolean {
    return this.creatingGroup();
  }

  toggleCreateGroup(event: Event): void {
    event.preventDefault();
    this.creatingGroup.update(value => !value);
  }

  selectList(listName: string): void {
    this.selectedListName.set(listName);
    setTimeout(() => {
      this.closePurchasePopoverTop();
    }, 500);
  }

  cancelCreateGroup(): void {
    this.creatingGroup.set(false);
    this.groupName.set('');
  }

  addGroup(): void {
    if (this.groupName() && this.groupName().trim().length > 0) {

      setTimeout(() => {
        this.creatingGroup.set(false);
        this.groupName.set('');
        this.closePurchasePopover();
      }, 500);
    } else {
      console.error('Group name cannot be empty');
    }
  }

  handleShortlistClick(): void {
    const applicantId = this.applicant().applicantId;
    const applicantName = this.applicant().applicantName;

    const shortlistUrl = this.applicantCardService.generateShortlistCvUrl(applicantId, applicantName);
    const applicant = this.applicant();
    this.modalService.setModalConfigs({
      attributes: {
        modalWidth: '1200px',
        isHideScroll: true,
      },
      inputs: {
        modalTitle: 'Shortlisted CV',
        previewUrl: shortlistUrl,

      },
      componentRef: IFrameLoaderComponent,
    });

  }

  parseExperiences = computed(() => {
    const experienceFrom = this.applicant()?.experienceFrom || '';
    const experiences = experienceFrom.split('*|*');

    return experiences.map(exp => {
      const parts = exp.split('##');
      return {
        company: parts[0],
        position: parts[1]
      };
    });
  });

  experienceCompany = computed(() => {
    const experienceFrom = this.applicant()?.experienceFrom || '';
    const parts = experienceFrom.split('##');
    return parts[0];
  });

  experiencePosition = computed(() => {
    const experienceFrom = this.applicant()?.experienceFrom || '';
    const parts = experienceFrom.split('##');
    if (parts.length > 1) {
      return parts[1];
    }
    return;
  });

  // Update getPurchaseList method
  getPurchaseList(): void {
    if (this.applicantCardService.isAlreadyAssigned()) {
      this.addCv();
    } else {
      if (this.purchasedlistData && this.purchasedlistData.length > 0) {
        this.purchasePopoverVisible.set(true);
        return;
      }

      this.applicantCardService.getPurchaseList().subscribe({
        next: (res) => {
          this.purchasePopoverVisible.set(true);
          this.purchasedlistData = res.data;
        },
        error: (error) => {
          // console.error('Error fetching purchase list:', error);
        }
      });
    }
  }

  createPurchaseListBtn(): void {
    this.isCreatePurchaseList.set(true);
  }

  backToPurchaseList(): void {
    this.isCreatePurchaseList.set(false);
  }

  createNewPurchaseList(): void {
    if (this.newPurchaseListName.value?.trim() === '') {
      this.toastr.warning('Please enter a purchase list name', 'Warning');
      return;
    }
    if (this.newPurchaseListName.valid) {
      if (this.applicantCardService.purchaseListId() === '') {
        this.addedToPurchasedList.emit(true);
        this.purchasePopoverVisible.set(false);

        const applicantId = this.applicant().applicantId;
        const newPurchaseList: PurchaseList = {
          id: '',
          cpId: this.localStorageService.getItem(CompanyIdLocalStorage),
          purchaseListId: 0,
          purchaseListName: this.newPurchaseListName.value || '',
          purchaseListDescription: '',
          purchaseCVs: [{
            EncCandId: applicantId,
            candidateId: 0,
            purchaseDate: '0001-01-01T00:00:00.000+00:00',
            expiryDate: '0001-01-01T00:00:00.000+00:00'
          }],
          userId: this.localStorageService.getItem(UserId)
        };

        this.purchaseListData.emit(newPurchaseList);
        this.purchasePopoverVisible.set(false);
        this.PurchaseListName.set(newPurchaseList.purchaseListName);

        this.applicantCardService.createNewPurchase(newPurchaseList).subscribe({
          next: (res) => {
            this.applicantCardService.wishlistCv.set(0);
            this.applicantCardService.currentCv.set(1);

            let numericListId = 0;
            if (res.data && res.data.length > 0) {
              numericListId = res.data[0].listId;
            }

            this.applicantCardService.setSelectedPurchaseList(
              res.id,
              numericListId,
              newPurchaseList.purchaseListName
            );

            this.PurchaseListName.set(newPurchaseList.purchaseListName);
            this.isPurchasedBtnFade.set(true);

            this.applicantCardService.addApplicantToSelection(applicantId);

            if (this.isPurchasedBtnFade()) {
              this.applicantCardService.isAlreadyAssigned.set(true);
            }

            this.applicantCardService.purchaseListId.set(res.id);
            this.toastr.success('New list created and CV added', 'Success');
          },
          error: (err) => {
            this.toastr.error('Error creating list', err.message);
          }
        });
      }
    }
  }


  // Update selectedPurchaseList method
  selectedPurchaseList($event: PurchaseListItem): void {
    this.selectedList.set($event);
    this.PurchaseListName.set($event.listName);
    this.PurchaseListId.set($event.id);
    this.applicantCardService.setSelectedPurchaseList($event.id, $event.listId, $event.listName);
    this.applicantCardService.wishlistCv.set($event.wishlist);
  }

  addCvToPurchaseList(): void {
    if (!this.selectedList() || !this.PurchaseListId()) {
      this.toastr.warning('Please select purchase list first', 'Warning');
      return;
    }

    this.purchasePopoverVisible.set(false);
    const applicantId = this.applicant().applicantId;
    const purchaseList: PurchaseList = {
      id: this.PurchaseListId(),
      cpId: this.localStorageService.getItem(CompanyIdLocalStorage),
      purchaseListId: 0,
      purchaseListName: this.PurchaseListName(),
      purchaseListDescription: "",
      purchaseCVs: [{
        EncCandId: applicantId,
        candidateId: 0,
        purchaseDate: '0001-01-01T00:00:00.000+00:00',
        expiryDate: '0001-01-01T00:00:00.000+00:00'
      }],
      userId: this.localStorageService.getItem(UserId)
    };

    this.applicantCardService.addApplictionToPurchaseList(purchaseList)
      .pipe(
        filter(response => response.responseCode === ResponseCode.success),
      )
      .subscribe({
        next: (response) => {
          this.applicantCardService.purchaseListId.set(this.PurchaseListId());
          this.applicantCardService.selectedListName.set(purchaseList.purchaseListName);
          this.applicantCardService.currentCv.update(c => c + 1);
          this.applicantCardService.addApplicantToSelection(applicantId);

          this.toastr.success('CV added to list successfully', 'Success');
          this.isPurchasedBtnFade.set(true);
          this.applicantCardService.isAlreadyAssigned.set(true);
          this.purchasePopoverVisible.set(false);
          this.addedToPurchasedList.emit(true);
        },
        error: (err) => {
          this.applicantCardService.setSelectedPurchaseList('', 0, '');
        }
      });
  }

  addCv(): void {
    const selectedListId = this.applicantCardService.purchaseListId();
    const selectedListName = this.applicantCardService.selectedListName();

    if (!selectedListId || !selectedListName) {
      this.toastr.warning('Please select purchase list first', 'Warning');
      return;
    }

    const applicantId = this.applicant().applicantId;
    const purchaseList: PurchaseList = {
      id: selectedListId,
      cpId: this.localStorageService.getItem(CompanyIdLocalStorage),
      purchaseListId: 0,
      purchaseListName: selectedListName,
      purchaseListDescription: "",
      purchaseCVs: [{
        EncCandId: applicantId,
        candidateId: 0,
        purchaseDate: '0001-01-01T00:00:00.000+00:00',
        expiryDate: '0001-01-01T00:00:00.000+00:00'
      }],
      userId: this.localStorageService.getItem(UserId)
    };
    this.purchaseListData.emit(purchaseList);

    this.applicantCardService.addApplictionToPurchaseList(purchaseList).subscribe({
      next: (response) => {
        this.applicantCardService.purchaseListId.set(selectedListId);
        this.applicantCardService.selectedListName.set(selectedListName);
        this.applicantCardService.currentCv.update(c => c + 1);
        this.applicantCardService.addApplicantToSelection(applicantId);

        this.toastr.success('CV added successfully', 'Success');
        this.isPurchasedBtnFade.set(true);
        this.purchasePopoverVisible.set(false);
      },
      error: (err) => this.toastr.error('Error adding CV to list')
    });
  }

}
