/*                                                                             
  MSP430 Emulator                                                              
  Copyright (C) 2014, 2015 Rudolf Geosits (rgeosits@live.esu.edu)              
                                                                               
  This program is free software: you can redistribute it and/or modify         
  it under the terms of the GNU General Public License as published by         
  the Free Software Foundation, either version 3 of the License, or            
  (at your option) any later version.                                          
                                                                               
  This program is distributed in the hope that it will be useful,              
  but WITHOUT ANY WARRANTY; without even the implied warranty of               
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 
  GNU General Public License for more details.                                 
                                                                               
  You should have received a copy of the GNU General Public License            
  along with this program. If not, see <http://www.gnu.org/licenses            
*/

/* Dump Bytes, Dump Words, Dump Double Words */
typedef enum {BYTE_STRIDE, WORD_STRIDE, DWORD_STRIDE} Stride;   
enum {MAX_BREAKPOINTS = 10};

/* Main command loop */
void command_loop()
{
  static uint8_t go = 0;
  static uint16_t breakpoint_addresses[MAX_BREAKPOINTS];
  static uint8_t cur_bp_number = 0;
  char command[32];

  /* Check for breakpoints 
  int i;
  for (i = 0;i < cur_bp_number;i++) {
    if (PC = breakpoint_addresses[i]) {
      go = 0; /* Stop fast execution 
      printf("\n\t[Breakpoint %d hit]\n\n", i + 1);
      break;
    }
  }
*/

  display_registers();

  while (!go) {
    memset(command, 0, sizeof(command));
    scanf("%s", command);
    filter_uppercase(command);

    /* st X, step X instructions forward, defaults to 1 */
    if ( strncmp("st", command, sizeof "st") == 0 ) {
      break;
    }                                 

    /* go, run the program until a breakpoint is hit */
    else if ( strncmp("go", command, sizeof "go") == 0 ) {
      go = 1;
      break;
    }

    /* Display all 16 registers */
    else if ( strncmp("r", command, sizeof "r") == 0 ) {
      display_registers();
      continue;
    }
    
    /* Display all breakpoints */
    else if ( strncmp("bps", command, sizeof "bps" ) == 0) {
      if (cur_bp_number > 0) {
	int i;
	for (i = 0;i < cur_bp_number;i++) {
	  printf("\t[%d] 0x%04X\n", i + 1, breakpoint_addresses[i]);
	}
      }
      else {
	puts("You have not set any breakpoints!\n");
      }
      
      continue;
    }

    /* d(b/w/d) ADDRESS, dump bytes, words, or double words at ADDRESS */
    /* d(b/w/d) REGISTER, dump from register value address */
    else if ( command[0] == 'd' && 
	      (command[1] == 'b' || command[1] == 'w' || command[1] == 'd') ) {

      char param1[20];
      uint32_t start_addr, stride;
      
      memset(param1, 0, sizeof param1);
      scanf("%s", param1);
      filter_uppercase(param1);

      if (param1[0] >= 0x30 && param1[0] <= 0x39) {   /* Got hex ADDRESS */
	sscanf(param1, "%X", &start_addr);
      }
      else if (param1[0] == '%' || param1[0] == 'r') {   /* Got Register */
	start_addr = (uint16_t) *get_reg_ptr( reg_name_to_num(param1) );
      }
      
      if (command[1] == 'b') {
	stride = BYTE_STRIDE;
      }
      else if (command[1] == 'w') {
	stride = WORD_STRIDE;
      }
      else {
	stride = DWORD_STRIDE;
      }

      dump_memory(MEMSPACE, 0x0, start_addr, stride);	
    }

    /* dis ADDRESS, Dump a disassembly from ADDRESS */
    else if ( strncmp("dis", command, sizeof "dis") == 0 ) {
      printf("DISASSEMBLY\n");
    }

    /* setr REG_VAL, set a register to some value */
    else if ( strncmp("setr", command, sizeof "setr") == 0 ) {
      int value = 0;
      char reg_name[10];
      
      scanf("%s %X", reg_name, &value);
      filter_uppercase(reg_name);

      uint16_t *reg = get_reg_ptr( reg_name_to_num(reg_name) );
      *reg = value;
      
      continue;
    }

    /* setm MEMLOC VAL, set a memory location to some value */
    else if ( strncmp("setm", command, sizeof "setm") == 0 ) {
      uint16_t value = 0;
      uint16_t virtual_addr;

      scanf("%X %X", (unsigned int *) &virtual_addr, (unsigned int *)&value);
      *get_addr_ptr(virtual_addr) = value;
      
      continue;
    }

    /* setb BREAKPOINT_ADDRESS */
    else if ( strncmp("setb", command, sizeof "setb") == 0 ) {
      if (cur_bp_number >= MAX_BREAKPOINTS) {
	printf("Too many breakpoints.\n");
      }
      else {
	scanf("%X", (unsigned int *) 
	      &breakpoint_addresses[cur_bp_number]);
	printf("\n\t[Breakpoint [%d] Set]\n", cur_bp_number + 1);
      
	++cur_bp_number;
      }
      
      continue;
    }

    /* help, display a list of debugger commands */
    else if ( strncmp("help", command, sizeof "help") == 0 ) {
      printf("\td(b|w|d) HEX_ADDR|Rn : Dump Memory At HEX_ADDR or Rn\n\tsetr "\
	     "Rn HEX_VALUE : Set Register Value\n\tst : Step Instruction\n\t"\
	     "setm HEX_ADDR HEX_VALUE : Set Memory Location HEX_ADDR value " \
	     "HEX_VALUE\n\tsetb BREAKPOINT_ADDR\n\tbps : view breakpoints\n\n"
      );
    }

    /* End the command loop, next instruction */
    else {
      
      break;
    }
  }
}

/*   Display all 16 registers
 *      - Toggle between Common mode and Specific mode
 *         (Common: Display all as R0 - R15)
 *         (Specific: Display Register usages like PC, SR, etc.)
 */

enum {COMMON_MODE, SPECIFIC_MODE};
uint8_t register_display_mode = SPECIFIC_MODE;

void display_registers()
{
  typedef enum {UNDEF, LINUX, WINDOWS} System_t;
  System_t this_system;
  
#ifdef __linux
  this_system = LINUX;
#else
  this_system = UNDEF;
#endif
  
  uint16_t r2 = sr_to_value();
  char *r0_name = "%R0:";
  char *r1_name = "%R1:";
  char *r2_name = "%R2:";
  char *r3_name = "%R3:";

  if (register_display_mode == SPECIFIC_MODE) {
    r0_name = "PC: ";
    r1_name = "SP: ";
    r2_name = "SR: ";
    r3_name = "CG2:";
  }

  printf("\n%s%04X %s%04X %s%04X %s%04X %%R4:%04X\n" \
         "%%R5:%04X %%R6:%04X %%R7:%04X %%R8:%04X %%R9:%04X\n" \
         "%%R10:%04X   %%r11:%04X  %%r12:%04X   %%R13:%04X\n" \
         "%%R14:%04X   %%R15:%04X  V:%d   N:%d   Z:%d   C:%d\n\n",

         r0_name, (uint16_t)PC, r1_name, (uint16_t)SP, r2_name, (uint16_t)r2, 
	 r3_name, (uint16_t)CG2, (uint16_t)r4, (uint16_t)r5, (uint16_t)r6, 
	 (uint16_t)r7, (uint16_t)r8, (uint16_t)r9, (uint16_t)r10, 
	 (uint16_t)r11, (uint16_t)r12, (uint16_t)r13, (uint16_t)r14, 
	 (uint16_t)r15, 
	
	 SR.overflow, SR.negative, SR.zero, SR.carry);
}

//##########+++ Dump Memory Function +++##########
void dump_memory(uint8_t *MEM, uint32_t size, 
		 uint32_t start_addr, uint8_t stride)
{
  uint32_t i, msp_addr = start_addr;
  MEM += start_addr;

  puts("");

  for (i = 0; i < 32; i += 8) {
    printf("0x%04X:\t", msp_addr);

    if ( stride == BYTE_STRIDE ) {
      printf("0x%02X  0x%02X  0x%02X  0x%02X  " \
	     "0x%02X  0x%02X  0x%02X  0x%02X\n",
             *(MEM+0),*(MEM+1),*(MEM+2),*(MEM+3),
	     *(MEM+4),*(MEM+5),*(MEM+6),*(MEM+7));
    }
    else if ( stride == WORD_STRIDE ) {
      printf("0x%02X%02X  0x%02X%02X  0x%02X%02X  0x%02X%02X\n",
             *(MEM+0),*(MEM+1),*(MEM+2),*(MEM+3),*(MEM+4),
	     *(MEM+5),*(MEM+6),*(MEM+7));
    }
    else if ( stride == DWORD_STRIDE ) {
      printf("0x%02X%02X%02X%02X  0x%02X%02X%02X%02X\n",
             *(MEM+0),*(MEM+1),*(MEM+2),*(MEM+3),*(MEM+4),
	     *(MEM+5),*(MEM+6),*(MEM+7));
    }
    
    MEM += 8;        /* Increase character by 4 */
    msp_addr += 8;   /* Increase msp_addr by 4  */
  }

  puts("");
}
