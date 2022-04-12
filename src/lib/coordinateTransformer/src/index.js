module.exports = class CoordinateTranstormer {
  #result;
  shortWordsRegions = new Map([
    ['서울특별시', '서울'],
    ['부산광역시', '부산'],
    ['대구광역시', '대구'],
    ['인천광역시', '인천'],
    ['광주광역시', '광주'],
    ['대전광역시', '대전'],
    ['울산광역시', '울산'],
    ['경기도', '경기'],
    ['강원도', '강원'],
    ['충청북도', '충북'],
    ['충청남도', '충남'],
    ['전라북도', '전북'],
    ['전라남도', '전남'],
    ['경상북도', '경북'],
    ['경상남도', '경남'],
    ['제주특별자치도', '제주'],
    ['세종특별자치시', '세종'],
  ]);

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  async #initResult() {
    require('dotenv').config();
    const END_POINT = process.env.COORDINATE_END_POINT;
    const API_KEY = process.env.COORDINATE_API_KEY;
    const axios = require('axios');
    let res = await axios.get(`${END_POINT}?x=${this.x}&y=${this.y}`, {
      headers: {
        Authorization: API_KEY,
      },
    });
    this.#result = res.data;
    return this.#result;
  }

  async getResult() {
    return this.#result == null ? await this.#initResult() : this.#result;
  }

  async resetXYvalue(x, y) {
    this.x = x;
    this.y = y;
    return await this.#initResult();
  }
  convertRegionWithShortWord(region_1depth_name) {
    return this.shortWordsRegions.get(region_1depth_name);
  }
};
