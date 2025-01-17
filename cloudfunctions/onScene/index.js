// 云函数 generateVideoRequest
const cloud = require('wx-server-sdk');
const https = require('https');

cloud.init({ env: 'common-0gtwhhyic77736c7' }); // 使用当前云环境

exports.main = async (event, context) => {
  const { inputVal } = event;

  if (!inputVal.trim()) {
    return { error: '请输入视频描述' };
  }

  try {
    const response = await httpRequest({
      method: 'POST',
      url: 'https://open.bigmodel.cn/api/paas/v4/videos/generations',
      headers: {
        'Authorization': 'Bearer 5b151d54367b4d5ad22270260b388644.9mb3hnZhONsLHYlL',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        model: 'cogvideox',
        prompt: inputVal
      }),
    });

    if (response.statusCode === 200 && response.data) {
      const { id, request_id } = JSON.parse(response.data);
      return { taskId: id, requestId: request_id };
    } else {
      return { error: '视频生成请求失败' };
    }
  } catch (err) {
    console.error('请求失败:', err);
    return { error: '请求失败' };
  }
};

// 通用的 HTTP 请求函数
async function httpRequest({ method, url, headers, data }) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: new URL(url).hostname,
      path: new URL(url).pathname + new URL(url).search,
      method,
      headers: {
        ...headers,
        ...(data ? {'Content-Length': Buffer.byteLength(data)} : {})
      }
    }, (res) => {
      let bufferData = '';
      res.on('data', (chunk) => {
        bufferData += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: bufferData });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}