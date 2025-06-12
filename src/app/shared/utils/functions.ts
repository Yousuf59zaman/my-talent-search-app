import { CustomCvDownloadResponse } from "../models/response";

interface FormattedDateTime {
  formattedDate: string;
  formattedTime: string;
}

export function redirectExternal(url: string): void {
    window.location.href = url;
}

export function groupByProperty(array: any[], property: string) {
    return array.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(obj);
        return acc;
    }, {});
}

export const formateDateTime = (scheduleDate: string): FormattedDateTime => {
  if(scheduleDate == '' || scheduleDate == undefined){
    return { formattedDate: "--", formattedTime:"--" };
  }
  
  const date = new Date(scheduleDate);
  const formattedDate = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const dateAndTime = { formattedDate, formattedTime };
  return dateAndTime;
};

export function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return ''; 
  const timePart = timeStr.split('T')[1] || timeStr.split(' ')[1] || timeStr;
  const [hoursStr, minutesStr] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr.substring(0, 2); 
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${hours}:${minutes} ${ampm}`;
}


export function formatChatDate(chatOn: string): string {
  const parts = chatOn.split(/[\s/:]+/); 
  if (parts.length < 5) {
    return 'Invalid date';
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; 
  const year = parseInt(parts[2], 10);
  const hours = parseInt(parts[3], 10);
  const minutes = parseInt(parts[4], 10);
  const isPM = parts[5] === 'PM';

  const date = new Date(year, month, day, isPM ? hours + 12 : hours, minutes);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const timeDifference = now.getTime() - date.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutesAgo = Math.floor(seconds / 60);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (seconds < 60) return 'just now';
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;

 
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return formatter.format(date);
}


export function formatDateToMMDDYYYY(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

export function IsNotEmptyObject(obj: {}): boolean {
  if (!obj) return false;
  return Object.keys(obj).length !== 0;
}

export function isValidDate(date: any) {
  return date instanceof Date && !isNaN(date.getTime());
}


export function downloadCustomizedCV(name: string, data: CustomCvDownloadResponse) {
  const byteCharacters = atob(data.file as string);
    const byteArray = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));

    const blobArray = new Blob([byteArray], { type: data.fileType});

    const blobUrl = URL.createObjectURL(blobArray);

    const applicantName = name.split(' ').map((namePart) => namePart.toLocaleLowerCase()).join('-');
    const fileName = `${applicantName}${data.fileExtention as string}`

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    downloadLink.click();

    URL.revokeObjectURL(blobUrl);
}