import { JoinPipe } from './join.pipe';


describe('JoinPipe ', () => {

    let pipe: JoinPipe;

    beforeEach(() => {
       pipe = new JoinPipe();
    });

    it('Should return "abcd"', () => {
       expect(pipe.transform(['a', 'b', 'c', 'd'], '')).toEqual('abcd');
    });

    it('Should return abc123', () => {
       expect(pipe.transform(['a', 'b', 'c', 1, 2, 3], '')).toEqual('abc123');
    });

    it ('Should return 1,2,3', () => {
       expect(pipe.transform([1, 2, 3], ',')).toEqual('1,2,3');
    });

    it('Should return the value unchanged', () => {
       expect(pipe.transform('a', '')).toEqual('a');
    });

});
