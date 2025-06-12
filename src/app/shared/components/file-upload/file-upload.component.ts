import { AfterViewChecked, Component, ElementRef, EventEmitter, inject, OnChanges, Output, output, signal, SimpleChanges, viewChild, input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { delay, of } from 'rxjs';

export const DefaultMaxSize = 100000;

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent implements AfterViewChecked, OnChanges {
  outputBoxVisible = false; 
  progress = signal<string>('0%');
  uploadResult = '';
  fileName = '';
  fileSize = '';
  uploadStatus = signal<number | undefined>(undefined);
  isPreview = signal<boolean>(false);
  img = viewChild<ElementRef<HTMLImageElement>>('preview');
  file!: File;
  allowedMimeTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  isImage = signal<boolean>(true); 

  readonly fileTypesToLimit = input<string>('');
  readonly maxFileSizeInKb = input(DefaultMaxSize / 1024);
  readonly maxWidth = input.required<number>();
  readonly maxHeight = input.required<number>();
  readonly payload = input.required<Record<string, number | string | File>>();
  readonly uploadTitle = input<string>('Image Upload');
  @Output() onSuccess = new EventEmitter<string>();
  @Output() onFileSelect = new EventEmitter<File>();
  @Output() uploadInProgress = new EventEmitter<boolean>();
  private toastr = inject(ToastrService);
  notes!: string;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileTypesToLimit'] || changes['maxFileSizeInKb'] || changes['maxWidth'] || changes['maxHeight']) {
      this.setValidationsNote(changes);
    }
  }
  
  ngAfterViewChecked(): void {
    if(!this.isImage()){
      return;
    }
    if (this.img() instanceof ElementRef) {
      const url = URL.createObjectURL(this.file);
      const img = this.img() as ElementRef<HTMLImageElement>;
      img.nativeElement.src = url;
      img.nativeElement.onload = () => {
        URL.revokeObjectURL(url);
        const width = img.nativeElement.naturalWidth;
        const height = img.nativeElement.naturalHeight;
        const maxWidth = this.maxWidth();
        const maxHeight = this.maxHeight();
        if (maxWidth && maxHeight && (width > maxWidth || height > maxHeight)) {
          this.isPreview.update(() => false);
          this.toastr.error(`Maximum width is ${maxWidth}px & Maximum height is ${maxHeight}px`);
        }
      };
    }
  }

  private setValidationsNote(changes: SimpleChanges) {
    this.notes = 'Note: ';
    const fileTypesToLimit = this.fileTypesToLimit();
    if (changes['fileTypesToLimit'] && fileTypesToLimit.length) {
      this.notes = this.notes + `Image must be at ${fileTypesToLimit} format.`;
    }
    if (changes['maxFileSizeInKb']) {
      this.notes = this.notes + `Its size will be below ${this.maxFileSizeInKb()} KB. `
    }
    if (changes['maxWidth'] && changes['maxHeight']) {
      this.notes += `width & height can be maximum ${this.maxWidth()} x ${this.maxHeight()} pixels.`
    }
  }

  private checkFileValidation(file: File) {
    if (!file) {
      this.toastr.error("Please select a file");
      return false;
    }
    if ((file.size / 1024) > this.maxFileSizeInKb()) {
      this.toastr.error("File size is too Big");
      return false;
    }
    const fileNames = file.name.split('.');
    const fileTypesToLimit = this.fileTypesToLimit();
    if (fileTypesToLimit.length && !fileTypesToLimit.includes(fileNames[fileNames.length-1])) {
      this.toastr.error(`Please select ${fileTypesToLimit}`);
      return false;
    }

    return true;
  }

  onFileSelected(event: any, inputFile: File | null) {
    const selectedFile = event.target.files[0];
    if (!this.checkFileValidation(selectedFile)) {
      return; 
    }
  
    this.outputBoxVisible = false;
    this.uploadResult = '';
    this.fileName = '';
    this.fileSize = '';
  
    this.file = inputFile || selectedFile;
    this.fileName = this.file.name;
    this.fileSize = `${(this.file.size / 1024).toFixed(2)} KB`;
  
    // Decide if it is an image or not
    // If it's in allowedMimeTypes => currently used for Excel
 
    if (this.allowedMimeTypes.includes(this.file.type)) {
    
      this.isImage.update(() => false);
    } else {
      this.isPreview.update(() => true);
    }
  
    this.onFileSelect.emit(this.file);
  }
  

  getBase64(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      console.log(reader.result);
    };
 }


  toggleUploadProgress(isVisible: boolean) {
    this.outputBoxVisible = isVisible;
    this.uploadInProgress.emit(isVisible);
  }


  upload() {
    if (this.file instanceof File) {
      this.toggleUploadProgress(true);
      const formData = new FormData();

      formData.append('ImgFile', this.file);
      const propKeys = Object.keys(this.payload());
      if (propKeys.length) {
        for (let index = 0; index < propKeys.length; index++) {
          const key = propKeys[index];
          formData.append(key, this.payload()[key] as string);
        }
      }
      const xhr = new XMLHttpRequest();
      xhr.open(
        'POST',
        'https://exam1.bdjobs.com/ExamImages/Corporate/Test_Img_Saving-tst.aspx',
        true
      );

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200 || xhr.status === 201) {
            this.uploadResult = 'Uploaded';
            this.isPreview.update(() => false);
            const url = `https://exam1.bdjobs.com/ExamImages/Corporate/JID_${this.payload()['hJID']}/${this.payload()['hImgName']}.jpg`;
            of(url)
              .pipe(delay(1000))
              .subscribe({
                next: (url) => {
                  this.onSuccess.emit(url);
                  this.uploadInProgress.emit(false);
                },
              });
          } else if (xhr.status === 400) {
            this.uploadResult = JSON.parse(xhr.response)!.message;
          } else {
            this.uploadResult = 'File upload failed!';
          }
          this.uploadStatus.update(() => (xhr.status === 0 ? 1 : xhr.status));
        }
      };

      xhr.upload.onprogress = (progressEvent) => {
        this.toggleUploadProgress(true);
        if (progressEvent.lengthComputable) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          this.progress.update(() => `${Math.round(progress)}%`);
        }
      };

      xhr.send(formData);
    }
  }

  cancel() {
    this.file = null as unknown as File;
    this.isPreview.update(() => false);
    this.toggleUploadProgress(false); 
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      const file: File = event.dataTransfer.files[0];
      this.onFileSelected(event, event.dataTransfer.files[0]);
    }
  }
}