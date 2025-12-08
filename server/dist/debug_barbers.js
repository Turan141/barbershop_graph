"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const mapBarber = (profile) => {
    const { user } = profile, rest = __rest(profile, ["user"]);
    return Object.assign(Object.assign(Object.assign({}, user), rest), { 
        // Ensure ID is the barber profile ID, not user ID (though spread order handles this, let's be explicit if needed, but rest.id comes after user.id)
        specialties: JSON.parse(rest.specialties), schedule: JSON.parse(rest.schedule), portfolio: JSON.parse(rest.portfolio), holidays: rest.holidays ? JSON.parse(rest.holidays) : undefined });
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const barbers = yield prisma.barberProfile.findMany({
                include: {
                    user: true,
                    services: true
                }
            });
            console.log('Raw barbers count:', barbers.length);
            try {
                const mapped = barbers.map(mapBarber);
                console.log('Mapped barbers successfully:', mapped.length);
                console.log('First mapped barber:', JSON.stringify(mapped[0], null, 2));
            }
            catch (e) {
                console.error('Error mapping barbers:', e);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            yield prisma.$disconnect();
        }
    });
}
main();
