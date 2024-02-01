import jsYaml from "js-yaml";
import * as fs from "fs";
import {LocalConfig} from "./types";

// 定义一个函数来读取和解析 YAML 配置文件
function readConfig(): LocalConfig | null {
    try {
        // 使用 fs.readFileSync 方法读取文件内容
        const fileContents = fs.readFileSync(process.cwd() + '/config.yml', 'utf8');
        // 使用 yaml.load 方法将 YAML 字符串转换为 JavaScript 对象
        // 如果不是LocalConfig，返回null
        return jsYaml.load(fileContents) as LocalConfig;
    } catch (e) {
        console.error('Failed to read config file:', e);
        return null;
    }
}

const config = readConfig();
export default config;