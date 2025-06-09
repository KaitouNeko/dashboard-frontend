/**
 * 將音訊檔轉錄為文字
 * 這個函數可以接收錄音的二進制數據，並返回轉錄後的文字
 * 
 * @param blob - 音訊數據的二進制 Blob
 * @returns 返回轉錄後的文字內容
 */
export const transcribeAudio = async (blob: Blob): Promise<string> => {
  try {
    // 建立一個 FormData 物件來傳送音訊檔案
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    // 發送請求到後端 API 進行轉錄
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (error) {
    console.error('Error during audio transcription:', error);
    return '';
  }
}; 