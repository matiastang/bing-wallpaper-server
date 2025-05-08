/*
 * @Author: matiastang
 * @Date: 2025-05-07 17:04:38
 * @LastEditors: matiastang
 * @LastEditTime: 2025-05-08 17:20:11
 * @FilePath: /bing-wallpaper-server/src/index.ts
 * @Description: bing-wallpaper-server
 */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

/**
 * Bing壁纸图片类型
 */
interface BingWallpaperImage {
    startdate: string
    fullstartdate: string
    enddate: string
    url: string
    urlbase: string
    copyright: string
    copyrightlink: string
    title: string
    quiz: string
    wp: boolean
    hsh: string
    drk: number
    top: number
    bot: number
    hs: any[]
}

/**
 * Bing壁纸提示信息
 */
interface BingWallpaperTooltips {
    loading: string
    previous: string
    next: string
    walle: string
    walls: string
}

/**
 * Bing壁纸响应
 */
interface BingWallpaperResponse {
    images: BingWallpaperImage[]
    tooltips: BingWallpaperTooltips
}

// 创建服务
const server = new McpServer({
  name: "bing-wallpaper",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// 添加一个测试用的加法tool

// 定义输入参数 schema
const addSchema = z.object({
    a: z.number(),
    b: z.number(),
});
  
// 推导类型
type AddInput = z.infer<typeof addSchema>;

server.tool("bing-wallpaper-add",
    { a: z.number(), b: z.number() },
    async ({ a, b }: AddInput) => ({
      content: [{ type: "text", text: String(a + b) }]
    })
);

// 静态资源测试
server.resource(
    "bing-wallpaper-info",
    "app://info",
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: "这是一个获取最近的 bing 壁纸图片的服务"
        }],
        _meta: {
            title: '服务信息',
            description: 'bing 壁纸服务的基本信息',
            copyright: '@MatiasTang',
        },
    })
);

// 使用纯的Base64编码，不需要添加任何前缀，例如 "data:image/png;base64,"。
// const logoBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAAEklEQVR4nGP8z4APMOGVHbHSAEEsAROxCnMTAAAAAElFTkSuQmCC"

// server.resource(
//     "bing-wallpaper-logo",
//     "app://logo",
//     async (uri) => ({
//         contents: [
//             {
//                 uri: uri.href,
//                 blob: logoBase64, // 如果是二进制图像，可以用 blob 字段
//                 mimeType: "image/png", // 或 "image/jpeg" 如果你传 blob
//             },
//         ],
//         _meta: {
//             title: '每日壁纸logo',
//             description: '每日壁纸的logo图片',
//             copyright: '@MatiasTang',
//         },
//     })
// )

/*
图片带前缀（data:image/png;base64,）提示：
Error accessing MCP resource: \[ { "validation": "base64", "code": "invalid\_string", "message": "Invalid base64", "path": \[ "contents", 0, "blob" ] } ]
图片不带前缀提示：
(Empty response)
*/
  
// 动态资源测试
server.resource(
    "bing-wallpaper-user-info",
    new ResourceTemplate("users://{userId}/info", { list: undefined }),
    async (uri, { userId }) => ({
        contents: [{
            uri: uri.href,
            text: `这里是URERID=${userId}的用户的基本信息`
        }],
        _meta: {
            title: '用户基本信息',
            description: 'userId对应用户的基本信息',
            copyright: '@MatiasTang',
        },
    })
);

server.resource(
    "bing-wallpaper-index",
    new ResourceTemplate("bingwallpaper://{index}", { list: undefined }),
    async (uri: URL, { index }) => {

        console.error("[MCP] 收到请求：", uri, index);

        let idx = 0
        try {
            idx = Number(index)
        } catch (error) {
            console.error("[MCP] index 转换失败：", index);
        }
    
        const images = await getBingWallpaper();
    
        if (images.length <= 0) {
            return {
                contents: [
                    {
                        uri: uri.href,
                        text: '获取Bing壁纸失败', // 如果是二进制图像，可以用 blob 字段
                        mimeType: "text/plain", // 或 "image/jpeg" 如果你传 blob
                    },
                ],
                _meta: {
                    title: 'Bing 每日壁纸',
                    description: 'Bing 最新的壁纸',
                    copyright: '@MatiasTang',
                },
            } as ReadResourceResult;
        }
    
        const firstImage = images[0];
    
        console.error("[MCP] 获取到壁纸信息：", firstImage);
    
        const title = "Bing 每日壁纸";
        const description = `Bing 最新的壁纸图，名为${firstImage.title}`;
        const copyright = firstImage.copyright;
        const imageUrl = `https://cn.bing.com${firstImage.url}`
    
        // const blobBase64 = await getImageBase64(imageUrl);
    
        // console.error("[MCP] base64 length:", blobBase64.length);
    
        return {
            contents: [
                // {
                //     uri: uri.href,
                //     blob: blobBase64, // 如果是二进制图像，可以用 blob 字段
                //     mimeType: "image/jpeg", // 或 "image/jpeg" 如果你传 blob
                // },
                {
                    uri: uri.href,
                    text: `Bing 今日的图片地址为：${imageUrl}`, // 如果是二进制图像，可以用 blob 字段
                    mimeType: "text/plain", // 或 "image/jpeg" 如果你传 blob
                },
            ],
            _meta: {
                title,
                description,
                copyright,
            },
        } as ReadResourceResult;
    },
);


/**
 * 获取bing壁纸信息
 * @param idx 
 * @param num 
 * @returns 
 */
const getBingWallpaper = async (idx: number = 0, num: number = 1) => {
    
    // 目标URL
    const url = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=${num}`;

    // 发送GET请求
    const res = await fetch(url, { method: 'GET' });

    // 打印响应内容
    const data: BingWallpaperResponse = await res.json();
    const images = data.images;
    return images
}


/**
 * 获取图片的 base64 字符串
 * @param url 
 * @returns 
 */
// const getImageBase64 = async (url: string) => {
//     const res = await fetch(url).then((res) => res.blob())
//     const buffer = await res.arrayBuffer();
//     return Buffer.from(buffer).toString("base64");
// }

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Bing Wallpaper MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
