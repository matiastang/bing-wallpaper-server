/*
 * @Author: matiastang
 * @Date: 2025-05-07 17:04:38
 * @LastEditors: matiastang
 * @LastEditTime: 2025-05-08 17:12:46
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
// const logoBase64 = "iVBORw0KGgoAAAANSUhEUgAAAEUAAABFCAYAAAAcjSspAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAADVGVYSWZNTQAqAAAACAAIAQ8AAgAAAAYAAABuARAAAgAAAA4AAAB0ARIAAwAAAAEAAQAAARoABQAAAAEAAACCARsABQAAAAEAAACKASgAAwAAAAEAAgAAATIAAgAAABQAAACSh2kABAAAAAEAAACmAAAAAENhbm9uAENhbm9uIEVPUyBNNTAAAAAASAAAAAEAAABIAAAAATIwMTc6MDE6MDEgMDM6MDU6MTMAACaCmgAFAAAAAQAAAnSCnQAFAAAAAQAAAnyIIgADAAAAAQAGAACIJwADAAAAAQB9AACIMAADAAAAAQACAACIMgAEAAAAAQAAAH2QAAAHAAAABDAyMzGQAwACAAAAFAAAAoSQBAACAAAAFAAAApiQEAACAAAABwAAAqyQEQACAAAABwAAArSQEgACAAAABwAAAryRAQAHAAAABAECAwCSAQAKAAAAAQAAAsSSAgAFAAAAAQAAAsySBAAKAAAAAQAAAtSSBQAFAAAAAQAAAtySBwADAAAAAQAFAACSCQADAAAAAQAAAACSCgAFAAAAAQAAAuSSkAACAAAAAzg2AACSkQACAAAAAzg2AACSkgACAAAAAzg2AACgAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAAEWgAwAEAAAAAQAAAEWiDgAFAAAAAQAAAuyiDwAFAAAAAQAAAvSiEAADAAAAAQACAACkAQADAAAAAQAAAACkAgADAAAAAQAAAACkAwADAAAAAQAAAACkBgADAAAAAQAAAACkMQACAAAADQAAAvykMgAFAAAABAAAAwqkNAACAAAAHQAAAyqkNQACAAAACwAAA0gAAAAAAAAAAQAAAfQAAAAFAAAAATIwMTc6MDE6MDEgMDM6MDU6MTMAMjAxNzowMTowMSAwMzowNToxMwArMDA6MDAAACswMDowMAAAKzAwOjAwAAAAAAAJAAAAAQAAACUAAAAIAAAAAAAAAAEAAMSDAAAl4gAAACIAAAABAB6EgAAAATMAHoSAAAABKTEyNDAzMDAwMDkwNQAAAAAADwAAAAEAAAAtAAAAAQAAAAAAAAABAAAAAAAAAAFFRi1NMTUtNDVtbSBmLzMuNS02LjMgSVMgU1RNAAAwMDAwMDAwMDAwAADbX67bAAAACXBIWXMAAAsTAAALEwEAmpwYAAASQmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczphdXg9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvYXV4LyIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWZFWD0iaHR0cDovL2NpcGEuanAvZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnRpZmY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vdGlmZi8xLjAvIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICAgICAgICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyI+CiAgICAgICAgIDxhdXg6RmlybXdhcmU+RmlybXdhcmUgVmVyc2lvbiAxLjEuMDwvYXV4OkZpcm13YXJlPgogICAgICAgICA8YXV4OkxlbnNJbmZvPjE1LzEgNDUvMSAwLzAgMC8wPC9hdXg6TGVuc0luZm8+CiAgICAgICAgIDxhdXg6TGVucz5DYW5vbiBFRi1NMTUtNDVtbSBmLzMuNS02LjMgSVMgU1RNPC9hdXg6TGVucz4KICAgICAgICAgPGF1eDpMZW5zSUQ+NDE1MzwvYXV4OkxlbnNJRD4KICAgICAgICAgPGF1eDpGbGFzaENvbXBlbnNhdGlvbj4wLzE8L2F1eDpGbGFzaENvbXBlbnNhdGlvbj4KICAgICAgICAgPGV4aWY6V2hpdGVCYWxhbmNlPjA8L2V4aWY6V2hpdGVCYWxhbmNlPgogICAgICAgICA8ZXhpZjpFeHBvc3VyZU1vZGU+MDwvZXhpZjpFeHBvc3VyZU1vZGU+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xMzg8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpNYXhBcGVydHVyZVZhbHVlPjUwMzA3Lzk2OTg8L2V4aWY6TWF4QXBlcnR1cmVWYWx1ZT4KICAgICAgICAgPGV4aWY6SVNPU3BlZWRSYXRpbmdzPgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaT4xMjU8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6U2VxPgogICAgICAgICA8L2V4aWY6SVNPU3BlZWRSYXRpbmdzPgogICAgICAgICA8ZXhpZjpGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXQ+MjwvZXhpZjpGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpBcGVydHVyZVZhbHVlPjM3Lzg8L2V4aWY6QXBlcnR1cmVWYWx1ZT4KICAgICAgICAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPjAxMDA8L2V4aWY6Rmxhc2hQaXhWZXJzaW9uPgogICAgICAgICA8ZXhpZjpTdWJzZWNUaW1lT3JpZ2luYWw+ODY8L2V4aWY6U3Vic2VjVGltZU9yaWdpbmFsPgogICAgICAgICA8ZXhpZjpGb2NhbFBsYW5lWVJlc29sdXRpb24+MjAwMDAwMC8yOTc8L2V4aWY6Rm9jYWxQbGFuZVlSZXNvbHV0aW9uPgogICAgICAgICA8ZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MTwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpPjI8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT4zPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwvZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgICAgICAgPGV4aWY6RXhwb3N1cmVUaW1lPjEvNTAwPC9leGlmOkV4cG9zdXJlVGltZT4KICAgICAgICAgPGV4aWY6Rm9jYWxMZW5ndGg+MzQvMTwvZXhpZjpGb2NhbExlbmd0aD4KICAgICAgICAgPGV4aWY6Q3VzdG9tUmVuZGVyZWQ+MDwvZXhpZjpDdXN0b21SZW5kZXJlZD4KICAgICAgICAgPGV4aWY6T2Zmc2V0VGltZT4rMDA6MDA8L2V4aWY6T2Zmc2V0VGltZT4KICAgICAgICAgPGV4aWY6U2h1dHRlclNwZWVkVmFsdWU+OS8xPC9leGlmOlNodXR0ZXJTcGVlZFZhbHVlPgogICAgICAgICA8ZXhpZjpTdWJzZWNUaW1lRGlnaXRpemVkPjg2PC9leGlmOlN1YnNlY1RpbWVEaWdpdGl6ZWQ+CiAgICAgICAgIDxleGlmOlNjZW5lQ2FwdHVyZVR5cGU+MDwvZXhpZjpTY2VuZUNhcHR1cmVUeXBlPgogICAgICAgICA8ZXhpZjpFeHBvc3VyZVByb2dyYW0+NjwvZXhpZjpFeHBvc3VyZVByb2dyYW0+CiAgICAgICAgIDxleGlmOkZOdW1iZXI+NS8xPC9leGlmOkZOdW1iZXI+CiAgICAgICAgIDxleGlmOk9mZnNldFRpbWVEaWdpdGl6ZWQ+KzAwOjAwPC9leGlmOk9mZnNldFRpbWVEaWdpdGl6ZWQ+CiAgICAgICAgIDxleGlmOk1ldGVyaW5nTW9kZT41PC9leGlmOk1ldGVyaW5nTW9kZT4KICAgICAgICAgPGV4aWY6Rmxhc2ggcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8ZXhpZjpGdW5jdGlvbj5GYWxzZTwvZXhpZjpGdW5jdGlvbj4KICAgICAgICAgICAgPGV4aWY6RmlyZWQ+RmFsc2U8L2V4aWY6RmlyZWQ+CiAgICAgICAgICAgIDxleGlmOlJldHVybj4wPC9leGlmOlJldHVybj4KICAgICAgICAgICAgPGV4aWY6TW9kZT4wPC9leGlmOk1vZGU+CiAgICAgICAgICAgIDxleGlmOlJlZEV5ZU1vZGU+RmFsc2U8L2V4aWY6UmVkRXllTW9kZT4KICAgICAgICAgPC9leGlmOkZsYXNoPgogICAgICAgICA8ZXhpZjpGb2NhbFBsYW5lWFJlc29sdXRpb24+MjAwMDAwMC8zMDc8L2V4aWY6Rm9jYWxQbGFuZVhSZXNvbHV0aW9uPgogICAgICAgICA8ZXhpZjpPZmZzZXRUaW1lT3JpZ2luYWw+KzAwOjAwPC9leGlmOk9mZnNldFRpbWVPcmlnaW5hbD4KICAgICAgICAgPGV4aWY6RXhwb3N1cmVCaWFzVmFsdWU+MC8xPC9leGlmOkV4cG9zdXJlQmlhc1ZhbHVlPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTM4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6RXhpZlZlcnNpb24+MDIzMTwvZXhpZjpFeGlmVmVyc2lvbj4KICAgICAgICAgPGV4aWY6U3Vic2VjVGltZT44NjwvZXhpZjpTdWJzZWNUaW1lPgogICAgICAgICA8ZXhpZkVYOkJvZHlTZXJpYWxOdW1iZXI+MTI0MDMwMDAwOTA1PC9leGlmRVg6Qm9keVNlcmlhbE51bWJlcj4KICAgICAgICAgPGV4aWZFWDpQaG90b2dyYXBoaWNTZW5zaXRpdml0eT4xMjU8L2V4aWZFWDpQaG90b2dyYXBoaWNTZW5zaXRpdml0eT4KICAgICAgICAgPGV4aWZFWDpSZWNvbW1lbmRlZEV4cG9zdXJlSW5kZXg+MTI1PC9leGlmRVg6UmVjb21tZW5kZWRFeHBvc3VyZUluZGV4PgogICAgICAgICA8ZXhpZkVYOkxlbnNNb2RlbD5FRi1NMTUtNDVtbSBmLzMuNS02LjMgSVMgU1RNPC9leGlmRVg6TGVuc01vZGVsPgogICAgICAgICA8ZXhpZkVYOkxlbnNTZXJpYWxOdW1iZXI+MDAwMDAwMDAwMDwvZXhpZkVYOkxlbnNTZXJpYWxOdW1iZXI+CiAgICAgICAgIDxleGlmRVg6U2Vuc2l0aXZpdHlUeXBlPjI8L2V4aWZFWDpTZW5zaXRpdml0eVR5cGU+CiAgICAgICAgIDxleGlmRVg6TGVuc1NwZWNpZmljYXRpb24+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpPjE1LzE8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT40NS8xPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MC8xPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MC8xPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC9leGlmRVg6TGVuc1NwZWNpZmljYXRpb24+CiAgICAgICAgIDx4bXA6TW9kaWZ5RGF0ZT4yMDE3LTAxLTAxVDAzOjA1OjEzLjg2PC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHhtcDpSYXRpbmc+MDwveG1wOlJhdGluZz4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMTctMDEtMDFUMDM6MDU6MTMuODY8L3htcDpDcmVhdGVEYXRlPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+NzI8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOk1ha2U+Q2Fub248L3RpZmY6TWFrZT4KICAgICAgICAgPHRpZmY6TW9kZWw+Q2Fub24gRU9TIE01MDwvdGlmZjpNb2RlbD4KICAgICAgICAgPGRjOnJpZ2h0cz4KICAgICAgICAgICAgPHJkZjpBbHQ+CiAgICAgICAgICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCIvPgogICAgICAgICAgICA8L3JkZjpBbHQ+CiAgICAgICAg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"

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
