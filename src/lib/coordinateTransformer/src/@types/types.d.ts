declare module 'coordinate-transformer' {
  export namespace Coordinate {
    interface ICoordinateTransformer {
      x: string;
      y: string;
      getResult: () => Promise<AllInformation>;
      resetXYvalue: (x: number, y: number) => Promise<AllInformation>;
      convertRegionWithShortWord: (region_1depth_name: string) => string;
    }

    type AllRegionInformationType = {
      meta: { total_count: number };
      documents: RegionInformation[];
    };

    type RegionInformationType = {
      region_type: string;
      code: string;
      address_name: string;
      region_1depth_name: string;
      region_2depth_name: string;
      region_3depth_name: string;
      region_4depth_name: string;
      x: number;
      y: number;
    };
  }
}
